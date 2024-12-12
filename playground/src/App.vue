<script setup lang="ts">
import Editor from './Editor.vue'
import { input, load, output } from './states'
</script>

<template>
  <div py-2 md:py-4 fixed inset-0 flex flex-col>
    <div px-4 flex flex-wrap md:flex-nowrap gap-x-2 pb-2>
      <h1 text-xl md:text-3xl font-bold md:pb-2 select-none flex flex-wrap items-center gap-x-2>
        <img src="/favicon.ico" h-1em bg-gray-200 rounded-lg>
        <div @click="load(true)">
          LC3 Assembler
        </div>
        <div text-sm self-end flex items-center gap-1 op-80>
          By _Kerman
          <a
            i-carbon-logo-github flex-grow inline-block w-1.2em h-1.2em hover:op-80
            href="https://github.com/KermanX/lc3-assembler" target="_blank"
          />
        </div>
      </h1>
      <div flex-grow md:w-0 />
      <!-- <div flex w-fit md:flex-col h-min md:h-0 z-10 gap-x-4 font-mono items-end mr-2 mt-1 md:mt--2 leading-5>
        <label flex align-center gap-1 select-none>
          <span op-80>
            Preset:
          </span>
          <select v-model="preset" class="w-26 text-sm black bg-transparent mb--.2">
            <option value="smallest">Smallest</option>
            <option value="recommended">Recommended</option>
            <option value="safest">Safest</option>
            <option value="disabled">Disabled</option>
          </select>
        </label>
        <label flex align-center gap-1 select-none>
          <span op-80>
            Always inline:
          </span>
          <input v-model="alwaysInline" type="checkbox">
        </label>
        <label flex align-center gap-1 select-none>
          <span op-80>
            Minify by Oxc:
          </span>
          <input v-model="doMinify" type="checkbox">
        </label>
      </div> -->
    </div>
    <div flex-grow h-0 flex flex-col md:flex-row gap-x-2 gap-y-2>
      <div flex-grow h-0 md:h-full md:w-0 flex flex-col>
        <div flex items-center>
          <h2 md:text-xl pb-2 pl-4 select-none>
            LC3 Source
            <!-- <span text-sm op80 font-mono>
              (Raw: {{ debouncedInput.length }}B, Minified: {{ onlyMinifiedSize }}B)
            </span> -->
          </h2>
        </div>
        <Editor v-model="input" lang="lc3" class="flex-grow h-0 max-h-full" />
      </div>
      <div flex-grow h-0 md:h-full md:w-0 flex flex-col>
        <h2 md:text-xl pb-2 pl-4 select-none flex items-center>
          Binary
          <!-- <span text-sm font-mono self-end ml-2 mb--1>
            <span op80>(Raw: {{ treeShakedUnminifiedSize }}B,
              Minified: {{ treeShakedMinifiedSize }}B, </span>
            <math display="inline">
              <mfrac>
                <mi>Output Minified</mi>
                <mi>Input Minified</mi>
              </mfrac>
            </math>={{ treeShakeRate.toFixed(2) }}%<span op80>)</span>
          </span>
          <div flex-grow /> -->
        </h2>
        <div flex-grow relative max-h-full>
          <Editor :model-value="output.result ?? ''" lang="plaintext" readonly class="w-full h-full max-h-full" />
          <div
            z-20 absolute left-1 right-2 bottom--2 children:p-2 children:px-3 children:b-2 children:rounded flex
            flex-col gap-2
          >
            <div
              v-if="output.error" relative bg-op-80
              text-red-200 bg-red-900 b-red-500
            >
              <h3 text-lg pb-1>
                Error
              </h3>
              <div font-mono max-h-8em overflow-y-auto>
                <p style="text-indent: -1em" ml-1em>
                  {{ output.error }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
