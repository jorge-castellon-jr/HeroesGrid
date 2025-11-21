import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const jsonFilePath = path.join(__dirname, "../raw.json")

function removeData(data) {
	delete data["GUID"]
	delete data["Transform"]
	delete data["GMNotes"]
	delete data["AltLookAngle"]
	delete data["ColorDiffuse"]
	delete data["LayoutGroupSortIndex"]
	delete data["Locked"]
	delete data["Grid"]
	delete data["Snap"]
	delete data["IgnoreFoW"]
	delete data["MeasureMovement"]
	delete data["DragSelectable"]
	delete data["Autoraise"]
	delete data["Sticky"]
	delete data["Tooltip"]
	delete data["GridProjection"]
	delete data["HideWhenFaceDown"]
	delete data["Hands"]
	delete data["MaterialIndex"]
	delete data["MeshIndex"]
	delete data["LuaScript"]
	delete data["LuaScriptState"]
	delete data["XmlUI"]
	delete data["Bag"]
	delete data["SidewaysCard"]
	delete data["States"]

	// Recursively process ContainedObjects if they exist
	if (data["ContainedObjects"] && Array.isArray(data["ContainedObjects"])) {
		data["ContainedObjects"] = data["ContainedObjects"].map((obj) =>
			removeData(obj)
		)
	}

	return data
}

function parse() {
	const content = fs.readFileSync(jsonFilePath, "utf-8")

	const rawData = JSON.parse(content)

	console.log(rawData.ObjectStates.length)
	const filteredData = rawData.ObjectStates.reduce((prev, obj) => {
		if (obj["Name"] === "Infinite_Bag" && !!obj["Nickname"]) {
			const filteredObj = obj["ContainedObjects"].reduce((p, o) => {
				if (o["States"]) {
					Object.keys(o["States"]).map((key) => {
						const state = o["States"][key]
						// removeData will recursively handle all ContainedObjects
						p.push(removeData(state))
					})
				}
				if (o["Nickname"] && o["Name"] === "Bag") {
					// removeData will recursively handle all ContainedObjects
					p.push(removeData(o))
				}
				return p
			}, [])

			if (filteredObj.length > 0) {
				prev.push(filteredObj.map((o) => removeData(o)))
			}
		}
		return prev
	}, [])
	console.log(filteredData.length)

	fs.writeFileSync(
		path.join(__dirname, "../filteredData.json"),
		JSON.stringify(filteredData, null, 2)
	)
}

parse()
