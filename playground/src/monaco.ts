import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import * as monaco from 'monaco-editor'
import { shikiToMonaco } from '@shikijs/monaco'
import { createHighlighter } from 'shiki'
import lc3 from './lc3.tmLanguage.json'

window.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'typescript' || label === 'javascript')
      return new TsWorker()
    return new EditorWorker()
  },
}

monaco.languages.register({ id: 'lc3' })
monaco.languages.register({ id: 'plaintext' })

const highlighter = await createHighlighter({
  themes: [
    'vitesse-dark',
    'vitesse-light',
  ],
  langs: [
    lc3,
  ],
})

shikiToMonaco(highlighter, monaco)
