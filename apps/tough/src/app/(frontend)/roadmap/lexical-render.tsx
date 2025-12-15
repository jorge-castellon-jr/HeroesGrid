import React from 'react'

type LexicalTextNode = {
  type: 'text'
  text: string
  format?: number
}

type LexicalNode = {
  type?: string
  children?: LexicalNode[]
  text?: string
  format?: number
  tag?: string
  listType?: 'bullet' | 'number' | 'check'
  checked?: boolean
  // Link node shape varies; Payload typically stores data under `fields`
  fields?: { url?: string; newTab?: boolean }
  url?: string
  newTab?: boolean
}

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 1 << 1
const FORMAT_STRIKETHROUGH = 1 << 2
const FORMAT_UNDERLINE = 1 << 3
const FORMAT_CODE = 1 << 4

function applyInlineFormats(text: React.ReactNode, format?: number) {
  if (!format) return text
  let node: React.ReactNode = text

  if (format & FORMAT_CODE) node = <code className="rm-inlineCode">{node}</code>
  if (format & FORMAT_BOLD) node = <strong>{node}</strong>
  if (format & FORMAT_ITALIC) node = <em>{node}</em>
  if (format & FORMAT_UNDERLINE) node = <u>{node}</u>
  if (format & FORMAT_STRIKETHROUGH) node = <s>{node}</s>

  return node
}

function renderChildren(children: LexicalNode[] | undefined, keyPrefix: string): React.ReactNode {
  if (!children || children.length === 0) return null
  return children.map((child, idx) => <React.Fragment key={`${keyPrefix}-${idx}`}>{renderNode(child, `${keyPrefix}-${idx}`)}</React.Fragment>)
}

function renderNode(node: LexicalNode, key: string): React.ReactNode {
  switch (node.type) {
    case 'text': {
      const t = (node as LexicalTextNode).text ?? ''
      return applyInlineFormats(t, node.format)
    }

    case 'linebreak':
      return <br />

    case 'paragraph':
      return <p className="rm-proseP">{renderChildren(node.children, key)}</p>

    case 'heading': {
      const tag = (node.tag || 'h2').toLowerCase()
      const content = renderChildren(node.children, key)
      if (tag === 'h1') return <h1 className="rm-proseH1">{content}</h1>
      if (tag === 'h2') return <h2 className="rm-proseH2">{content}</h2>
      if (tag === 'h3') return <h3 className="rm-proseH3">{content}</h3>
      if (tag === 'h4') return <h4 className="rm-proseH4">{content}</h4>
      return <h5 className="rm-proseH4">{content}</h5>
    }

    case 'quote':
      return <blockquote className="rm-proseQuote">{renderChildren(node.children, key)}</blockquote>

    case 'list': {
      const isOrdered = node.listType === 'number'
      const Tag = isOrdered ? 'ol' : 'ul'
      return <Tag className="rm-proseList">{renderChildren(node.children, key)}</Tag>
    }

    case 'listitem': {
      const checkbox =
        typeof node.checked === 'boolean' ? (
          <input className="rm-proseChecklist" type="checkbox" checked={node.checked} readOnly />
        ) : null
      return (
        <li className="rm-proseLi">
          {checkbox}
          <span>{renderChildren(node.children, key)}</span>
        </li>
      )
    }

    case 'link': {
      const url = node.fields?.url || node.url || '#'
      const newTab = Boolean(node.fields?.newTab ?? node.newTab)
      return (
        <a
          className="rm-proseLink"
          href={url}
          target={newTab ? '_blank' : undefined}
          rel={newTab ? 'noreferrer noopener' : undefined}
        >
          {renderChildren(node.children, key)}
        </a>
      )
    }

    case 'horizontalrule':
      return <hr className="rm-proseHr" />

    default:
      // Fallback: render children if present.
      return <>{renderChildren(node.children, key)}</>
  }
}

export function LexicalRender(props: { value: unknown }) {
  const value = props.value as { root?: { children?: LexicalNode[] } } | null
  const children = value?.root?.children
  if (!children || children.length === 0) return null
  return <div className="rm-prose">{children.map((n, i) => <React.Fragment key={i}>{renderNode(n, `n${i}`)}</React.Fragment>)}</div>
}

