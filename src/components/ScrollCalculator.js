import { useState } from 'react'
import classNames from 'classnames'

import scroll from '../scroll.json'

const scrollList = Object.keys(scroll).map((name) => ({
  name,
  ...scroll[name],
}))

const STAT = ['HP', 'STR', 'MAG', 'SKL', 'SPD', 'LCK', 'DEF', 'CON', 'MOV']
const MAXIMUM_SELECTED_SCROLL = 7

function ScrollCalculator() {
  const [selectedScroll, setSelectedScroll] = useState({})
  const [charGrowthRate, setCharGrowthRate] = useState(
    getInitialCharacterGrowthRate()
  )

  const countSelectedScroll = Object.keys(selectedScroll).length
  const charGrowthRateResult = calculateCharGrowthRateResult(
    selectedScroll,
    charGrowthRate
  )

  return (
    <div className="container mx-auto p-2">
      <h1 className="text-xl mb-4">
        Fire Emblem Thracia 776 Scroll Calculator
      </h1>

      <table>
        <caption>
          Selected scroll count:
          <span
            className={classNames('ml-2', {
              'text-red-700 font-bold':
                countSelectedScroll >= MAXIMUM_SELECTED_SCROLL,
            })}
          >
            {countSelectedScroll}/{MAXIMUM_SELECTED_SCROLL}
          </span>
        </caption>
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 w-52 text-left">Scroll Name</th>
            {STAT.map((name) => (
              <th key={name} className="p-2 text-right">
                {name}
              </th>
            ))}
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {scrollList.map((scroll, index) => {
            const isSelected = selectedScroll[scroll.name] != null

            return (
              <tr
                key={scroll.name}
                className={classNames('w-12 p-1', {
                  'bg-gray-50': index % 2 !== 0,
                  'bg-yellow-100': isSelected,
                })}
              >
                <td className="p-2">{scroll.name}</td>
                {STAT.map((name) => {
                  const growthRate = scroll.growthRate[name]
                  return (
                    <td
                      key={name}
                      className={classNames('p-2 text-right', {
                        'bg-red-200': growthRate < 0,
                        'bg-green-200': growthRate > 0,
                      })}
                    >
                      {growthRate}
                    </td>
                  )
                })}
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    onChange={handleOnSelectScroll(scroll)}
                    disabled={
                      !isSelected &&
                      countSelectedScroll >= MAXIMUM_SELECTED_SCROLL
                    }
                  />
                </td>
              </tr>
            )
          })}

          <tr className="bg-gray-200">
            <td className="p-2"></td>
            {STAT.map((name) => (
              <td key={name} className="p-2 text-right font-bold">
                {name}
              </td>
            ))}
            <td className="p-2"></td>
          </tr>

          <tr>
            <td className="p-2">Character Growth Rate</td>
            {STAT.map((name) => (
              <td key={name} className="py-2">
                <input
                  type="text"
                  className="w-16 border-2 border-gray-200 rounded-sm px-2 py-1 text-right"
                  maxLength="3"
                  value={charGrowthRate[name] ? charGrowthRate[name] : 0}
                  onChange={handleOnInputCharacterGrowthRateChange(name)}
                />
              </td>
            ))}
            <td>&nbsp;</td>
          </tr>
          <tr>
            <td className="p-2">Total</td>
            {STAT.map((name) => (
              <td key={name} className="p-2 text-right">
                {charGrowthRateResult[name]}
              </td>
            ))}
            <td>&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>
  )

  function handleOnSelectScroll(scrollData) {
    return ({ target: checked }) => {
      setSelectedScroll((state) => {
        if (checked && state[scrollData.name]) {
          const newState = {}

          for (const scrollName in state) {
            if (scrollName !== scrollData.name) {
              newState[scrollName] = state[scrollName]
            }
          }

          return newState
        } else if (checked) {
          return {
            ...state,
            [scrollData.name]: scrollData,
          }
        }
      })
    }
  }

  function handleOnInputCharacterGrowthRateChange(statName) {
    return ({ target: { value } }) => {
      setCharGrowthRate((state) => ({
        ...state,
        [statName]: adjustCharacterGrowthRate(value),
      }))
    }
  }
}

export default ScrollCalculator

function getInitialCharacterGrowthRate() {
  const result = {}

  STAT.forEach((name) => (result[name] = 0))

  return result
}

function adjustCharacterGrowthRate(rate) {
  if (!/\d/.test(rate)) {
    return 0
  }

  let result = Number(rate)

  if (result > 100) {
    result = 100
  } else if (result < 0) {
    result = 0
  }

  return result
}

function calculateCharGrowthRateResult(selectedScroll, charGrowthRate) {
  const result = { ...charGrowthRate }

  for (const scrollName in selectedScroll) {
    const growthRate = selectedScroll[scrollName].growthRate

    for (const statName in growthRate) {
      result[statName] += growthRate[statName]
    }
  }

  return result
}
