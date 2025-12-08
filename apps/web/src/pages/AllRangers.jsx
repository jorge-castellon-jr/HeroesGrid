import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import RangerCard from '../components/cards/RangerCard'
import RangerImageToggle from '../components/RangerImageToggle'
import RangerEditModal from '../components/RangerEditModal'
import DisplayImageSelector from '../components/DisplayImageSelector'
import RangerDisplayImage from '../components/RangerDisplayImage'
import { database } from '../database'
import { Q } from '@nozbe/watermelondb'
import { initializeDatabase } from '../database/seed'
import { useImageToggle } from '../hooks/useImageToggle'
import { isAdminMode } from '../utils/adminMode'
import { friendlyURL, getColor } from '../utils/helpers'
import './AllRangers.scss'

const AllRangers = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [rangers, setRangers] = useState([])
  const [rangerRecords, setRangerRecords] = useState(new Map()) // Store DB records for editing
  const [teams, setTeams] = useState([])
  const [teamsDropdown, setTeamsDropdown] = useState(false)
  const [colorsDropdown, setColorsDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingRanger, setEditingRanger] = useState(null)
  const [editingImage, setEditingImage] = useState(null)
  const adminEnabled = isAdminMode()
  const { useImages, toggleUseImages } = useImageToggle()

  // Get filter state from URL
  const checkedTeams = useMemo(() => {
    const teamsParam = searchParams.get('teams')
    return teamsParam ? teamsParam.split(',').filter(Boolean) : []
  }, [searchParams])

  const checkedColors = useMemo(() => {
    const colorsParam = searchParams.get('colors')
    return colorsParam ? colorsParam.split(',').filter(Boolean) : []
  }, [searchParams])

  const colors = [
    { title: "Red", value: "#EF4444", text: "text-red-900" },
    { title: "Blue", value: "#60A5FA", text: "text-blue-900" },
    { title: "Black", value: "#1a202c", text: "text-gray-100" },
    { title: "Yellow", value: "#f6e05e", text: "text-yellow-900" },
    { title: "Pink", value: "#ed64a6", text: "text-pink-900" },
    { title: "Green", value: "#48bb78", text: "text-green-900" },
    { title: "White", value: "#f7fafc", text: "text-gray-900" },
    { title: "Purple", value: "#805ad5", text: "text-purple-900" },
    { title: "Orange", value: "#f6ad55", text: "text-orange-900" },
    { title: "Silver", value: "#a0aec0", text: "text-gray-900" },
    { title: "Gold", value: "#D97706", text: "text-yellow-900" },
    { title: "Shadow", value: "#7DD3FC", text: "text-sky-900" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Wait for database initialization
        await initializeDatabase();

        // Fetch rangers with team and season relationship
        const rangersCollection = database.get('rangers')
        const teamsCollection = database.get('teams')
        const seasonsCollection = database.get('seasons')

        const fetchedRangers = await rangersCollection.query(Q.where('published', true)).fetch()
        const fetchedTeams = await teamsCollection.query(Q.where('published', true)).fetch()
        // Fetch ALL seasons for ordering, not just published ones
        const fetchedSeasons = await seasonsCollection.query().fetch()

        // Create a season order map
        const seasonOrderMap = {}
        fetchedSeasons.forEach(s => {
          seasonOrderMap[s.id] = s.order
        })

        // Create a set of published team IDs for filtering
        const publishedTeamIds = new Set(fetchedTeams.map(t => t.id))

        // Transform WatermelonDB models to match component structure
        const recordsMap = new Map()
        const transformedRangers = (await Promise.all(
          fetchedRangers.map(async (r) => {
            const team = await r.team.fetch()

            // Skip rangers whose team is not published
            if (!team || !publishedTeamIds.has(team.id)) {
              return null
            }

            // Store the DB record for editing
            recordsMap.set(r.slug, r)
            return {
              name: r.name,
              rangerInfo: {
                slug: r.slug,
                team: team?.name || '',
                color: r.color,
                teamPosition: r.teamPosition,
                cardTitle: r.cardTitle,
                title: r.title,
                seasonOrder: (team?.seasonId && seasonOrderMap[team.seasonId]) || 9999
              },
              rangerCards: {
                image: r.imageUrl,
                displayImage: r.displayImage,
                abilityName: r.abilityName,
                abilityDesc: r.abilityDesc
              }
            }
          })
        )).filter(Boolean)
        setRangerRecords(recordsMap)

        // Sort rangers by season order, then by team position (numerically)
        transformedRangers.sort((a, b) => {
          if (a.rangerInfo.seasonOrder !== b.rangerInfo.seasonOrder) {
            return a.rangerInfo.seasonOrder - b.rangerInfo.seasonOrder
          }
          // Sort by team position within same season (numeric sort)
          const posA = a.rangerInfo.teamPosition || 9999
          const posB = b.rangerInfo.teamPosition || 9999
          return posA - posB
        })

        // Debug: Log all rangers to see sorting
        console.log('All rangers after sort:', transformedRangers.map(r => ({
          name: r.name,
          team: r.rangerInfo.team,
          teamPos: r.rangerInfo.teamPosition,
          seasonOrder: r.rangerInfo.seasonOrder
        })))

        const transformedTeams = fetchedTeams.map(t => ({
          _id: t.id,
          name: t.name,
          slug: { current: t.slug }
        }))

        setRangers(transformedRangers)
        setTeams(transformedTeams)
      } catch (error) {
        console.error('Error fetching rangers:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleEditClick = (e, ranger) => {
    e.preventDefault() // Prevent navigation
    const record = rangerRecords.get(ranger.rangerInfo.slug)
    if (record) {
      setEditingRanger(record)
    }
  }

  const handleSaveEdit = async () => {
    // Reload all rangers to reflect changes
    setIsLoading(true)
    const rangersCollection = database.get('rangers')
    const teamsCollection = database.get('teams')
    const seasonsCollection = database.get('seasons')

    const fetchedRangers = await rangersCollection.query(Q.where('published', true)).fetch()
    const fetchedTeams = await teamsCollection.query(Q.where('published', true)).fetch()
    // Fetch ALL seasons for ordering, not just published ones
    const fetchedSeasons = await seasonsCollection.query().fetch()

    const seasonOrderMap = {}
    fetchedSeasons.forEach(s => {
      seasonOrderMap[s.id] = s.order
    })

    // Create a set of published team IDs for filtering
    const publishedTeamIds = new Set(fetchedTeams.map(t => t.id))

    const recordsMap = new Map()
    const transformedRangers = (await Promise.all(
      fetchedRangers.map(async (r) => {
        const team = await r.team.fetch()

        // Skip rangers whose team is not published
        if (!team || !publishedTeamIds.has(team.id)) {
          return null
        }

        recordsMap.set(r.slug, r)
        return {
          name: r.name,
          rangerInfo: {
            slug: r.slug,
            team: team?.name || '',
            color: r.color,
            teamPosition: r.teamPosition,
            cardTitle: r.cardTitle,
            title: r.title,
            seasonOrder: (team?.seasonId && seasonOrderMap[team.seasonId]) || 9999
          },
          rangerCards: {
            image: r.imageUrl,
            displayImage: r.displayImage,
            abilityName: r.abilityName,
            abilityDesc: r.abilityDesc
          }
        }
      })
    )).filter(Boolean)

    // Sort rangers by season order, then by team position
    transformedRangers.sort((a, b) => {
      if (a.rangerInfo.seasonOrder !== b.rangerInfo.seasonOrder) {
        return a.rangerInfo.seasonOrder - b.rangerInfo.seasonOrder
      }
      const posA = a.rangerInfo.teamPosition || 9999
      const posB = b.rangerInfo.teamPosition || 9999
      return posA - posB
    })

    // Debug: Log first 5 rangers
    console.log('First 5 rangers after handleSaveEdit sort:', transformedRangers.slice(0, 5).map(r => ({
      name: r.name,
      team: r.rangerInfo.team,
      teamPos: r.rangerInfo.teamPosition,
      seasonOrder: r.rangerInfo.seasonOrder
    })))

    setRangers(transformedRangers)
    setRangerRecords(recordsMap)
    setIsLoading(false)
  }

  const handleTeamPositionChange = async (e, ranger, delta) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation() // Stop event from bubbling

    const record = rangerRecords.get(ranger.rangerInfo.slug)
    if (!record) return

    try {
      await database.write(async () => {
        await record.update((r) => {
          const newPosition = Math.round(((r.teamPosition || 0) + delta) * 10) / 10
          r.teamPosition = newPosition
        })
      })

      // Refresh the data
      await handleSaveEdit()
    } catch (error) {
      console.error('Error updating team position:', error)
    }
  }

  const filteredRangers = useMemo(() => {
    let filtered = rangers

    if (checkedTeams.length && checkedColors.length) {
      filtered = filtered.filter(r => {
        const team = checkedTeams.find(t => t === r.rangerInfo.team)
        const color = checkedColors.find(c => c.toLowerCase() === r.rangerInfo.color?.toLowerCase())
        return team && color
      })
    } else if (checkedTeams.length) {
      filtered = filtered.filter(r => {
        return checkedTeams.find(t => r.rangerInfo.team === t)
      })
    } else if (checkedColors.length) {
      filtered = filtered.filter(r => {
        return checkedColors.find(c => c.toLowerCase() === r.rangerInfo.color?.toLowerCase())
      })
    }

    return filtered
  }, [rangers, checkedTeams, checkedColors])

  const dropdownClick = (type) => {
    if (type === "colors") {
      setTeamsDropdown(false)
      setColorsDropdown(!colorsDropdown)
    }
    if (type === "teams") {
      setColorsDropdown(false)
      setTeamsDropdown(!teamsDropdown)
    }
  }

  const closeDropdowns = () => {
    setTeamsDropdown(false)
    setColorsDropdown(false)
  }

  const resetFiltered = () => {
    setSearchParams({})
  }

  const toggleTeam = (teamName) => {
    const newCheckedTeams = checkedTeams.includes(teamName)
      ? checkedTeams.filter(t => t !== teamName)
      : [...checkedTeams, teamName]

    const newParams = new URLSearchParams(searchParams)
    if (newCheckedTeams.length > 0) {
      newParams.set('teams', newCheckedTeams.join(','))
    } else {
      newParams.delete('teams')
    }
    setSearchParams(newParams)
  }

  const toggleColor = (colorTitle) => {
    const newCheckedColors = checkedColors.includes(colorTitle)
      ? checkedColors.filter(c => c !== colorTitle)
      : [...checkedColors, colorTitle]

    const newParams = new URLSearchParams(searchParams)
    if (newCheckedColors.length > 0) {
      newParams.set('colors', newCheckedColors.join(','))
    } else {
      newParams.delete('colors')
    }
    setSearchParams(newParams)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading rangers...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-center flex-1">All Rangers</h1>
        <RangerImageToggle useImages={useImages} onToggle={toggleUseImages} />
      </div>

      <div className="relative flex flex-wrap items-center justify-end gap-2 mb-4 z-20">
        <div className="pr-6">Filter:</div>
        <div className="teams relative">
          <button className="relative z-30 w-32 mr-4 bg-white card content" onClick={() => dropdownClick('teams')}>
            Teams
            {checkedTeams.length > 0 && <strong>({checkedTeams.length})</strong>}
          </button>
          {teamsDropdown && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={closeDropdowns}
              ></div>
              <div className="dropdown content card z-30">
                <div className="flex flex-wrap justify-center -mx-2">
                  <button className="w-full m-2 card content" onClick={resetFiltered}>Reset</button>
                  {teams.map(team => (
                    <div key={team._id} className="flex w-1/2 p-2 md:w-1/4">
                      <input
                        type="checkbox"
                        id={team.slug?.current || team._id}
                        checked={checkedTeams.includes(team.name)}
                        onChange={() => toggleTeam(team.name)}
                        className="hidden"
                      />
                      <label
                        htmlFor={team.slug?.current || team._id}
                        className="flex flex-col items-center justify-center w-full p-3 text-center transition-colors duration-300 border border-gray-200 rounded-lg shadow-lg cursor-pointer hover:bg-gray-200 checkbox"
                      >
                        {team.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="colors relative">
          <button className="relative z-30 w-32 bg-white card content" onClick={() => dropdownClick('colors')}>
            Colors
            {checkedColors.length > 0 && <strong>({checkedColors.length})</strong>}
          </button>
          {colorsDropdown && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={closeDropdowns}
              ></div>
              <div className="dropdown content card z-30">
                <div className="flex flex-wrap justify-center -mx-2">
                  <button className="w-full m-2 card content" onClick={resetFiltered}>Reset</button>
                  {colors.map((color, i) => (
                    <div key={i} className="flex w-1/2 h-32 p-2 md:w-1/4">
                      <input
                        type="checkbox"
                        id={color.title}
                        checked={checkedColors.includes(color.title)}
                        onChange={() => toggleColor(color.title)}
                        className="hidden"
                      />
                      <label
                        htmlFor={color.title}
                        className={`flex flex-col items-center justify-center w-full p-3 font-semibold tracking-wider text-center transition-all duration-300 border border-gray-200 rounded-lg shadow-lg opacity-50 cursor-pointer hover:opacity-100 checkbox-colors ${color.text} ${getColor(color.title)}`}
                      >
                        {color.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {filteredRangers.length > 0 && (
        <div className="flex flex-wrap justify-around -mx-3" id="rangersTeam">
          {filteredRangers.map((ranger, i) => (
            <div
              key={i}
              className={`relative p-3 w-1/2 flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'
                }`}
            >
              {/* Edit Button - Only visible in admin mode */}
              {adminEnabled && (
                <>
                  <button
                    onClick={(e) => handleEditClick(e, ranger)}
                    className="absolute top-6 right-6 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition z-10"
                    title="Edit Ranger"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingImage(ranger); }}
                    className={`absolute top-6 right-16 p-2 rounded-full shadow-lg transition z-10 ${
                      ranger.rangerCards?.displayImage
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                    title={ranger.rangerCards?.displayImage ? 'Edit Display Image' : 'Set Display Image'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </>
              )}


              <Link
                className="no-underline flex-1"
                to={`/${friendlyURL(ranger.rangerInfo.team)}/${ranger.rangerInfo.slug}`}
              >
                {useImages && ranger.rangerCards?.displayImage ? (
                  <RangerDisplayImage displayImage={ranger.rangerCards.displayImage} />
                ) : (
                  <RangerCard className="lg:max-w-lg" noDesc ranger={ranger} sanity />
                )}
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingRanger && (
        <RangerEditModal
          ranger={editingRanger}
          onClose={() => setEditingRanger(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Display Image Selector Modal */}
      {editingImage && (
        <DisplayImageSelector
          ranger={editingImage}
          onClose={() => setEditingImage(null)}
          onSave={async (displayImageData) => {
            const record = rangerRecords.get(editingImage.rangerInfo.slug)
            if (!record) return

            try {
              await database.write(async () => {
                await record.update((r) => {
                  r.displayImage = displayImageData
                })
              })

              await handleSaveEdit()
              setEditingImage(null)
            } catch (error) {
              console.error('Error updating display image:', error)
            }
          }}
        />
      )}
    </div>
  )
}

export default AllRangers
