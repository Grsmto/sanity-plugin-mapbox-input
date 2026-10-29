import {type ReactNode} from 'react'

export function definePlugin<T = unknown>(_config?: T) {
  return () => ({name: 'stub-plugin'})
}

export type SchemaType = {name?: string; type?: SchemaType; [key: string]: unknown}

export type Path = Array<string | number | {_key: string}>

export function set(value: unknown, path: Path = []) {
  return {type: 'set', path, value}
}

export function unset(path: Path = []) {
  return {type: 'unset', path}
}

export function setIfMissing(value: unknown, path: Path = []) {
  return {type: 'setIfMissing', path, value}
}

export function ChangeIndicator(props: {
  children?: ReactNode
  path?: Path
  isChanged?: boolean
  hasFocus?: boolean
}) {
  return props.children ?? null
}

export type ObjectInputProps<T = unknown, S = unknown> = {
  changed?: boolean
  elementProps?: unknown
  focused?: boolean
  onChange: (patch: unknown) => void
  onPathFocus: (path: Path) => void
  path: Path
  readOnly?: boolean
  schemaType: S
  value?: T
  [key: string]: unknown
}
