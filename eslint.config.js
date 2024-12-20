// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    vue: true,
  },
  {
    rules: {
      'ts/explicit-function-return-type': 'off',
    },
  },
)
