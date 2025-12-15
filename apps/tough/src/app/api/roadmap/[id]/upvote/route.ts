import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import config from '@/payload.config'

export async function POST(request: Request, context: { params: { id: string } }) {
  const { id } = context.params
  const payload = await getPayload({ config: await config })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  // Is there an existing vote?
  const existing = await payload.find({
    collection: 'roadmap-votes',
    overrideAccess: true,
    limit: 1,
    where: {
      and: [{ item: { equals: id } }, { user: { equals: user.id } }],
    },
  })

  let upvoted: boolean

  if (existing.totalDocs > 0) {
    await payload.delete({
      collection: 'roadmap-votes',
      id: existing.docs[0].id,
      overrideAccess: true,
    })
    upvoted = false
  } else {
    await payload.create({
      collection: 'roadmap-votes',
      overrideAccess: true,
      data: { item: id, user: user.id },
    })
    upvoted = true
  }

  const votes = await payload.find({
    collection: 'roadmap-votes',
    overrideAccess: true,
    limit: 0,
    where: { item: { equals: id } },
  })

  return NextResponse.json({ upvoted, upvoteCount: votes.totalDocs })
}

