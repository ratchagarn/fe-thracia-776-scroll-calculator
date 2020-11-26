import { useState } from 'react'
import scroll from '../scroll.json'

const scrollList = Object.keys(scroll).map((name) => ({
  name,
  ...scroll[name],
}))

const stat = ['HP', 'STR', 'MAG', 'SKL', 'SPD', 'LCK', 'DEF', 'CON', 'MOV']

function ScrollCalculator() {
  const [selectedScroll, setSelectedScroll] = useState({})
  const [charGrowthRate, setCharGrowthRate] = useState({})

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl mb-4">
        Fire Emblem Thracia 776 Scroll Calculator
      </h1>

      <table>
        <thead>
          <tr>
            <th className="p-4">Scroll Name</th>
            {stat.map((name) => (
              <th key={name} className="p-4">
                {name}
              </th>
            ))}
            <th className="p-4">
              <input type="checkbox" />
            </th>
          </tr>
        </thead>
        <tbody>
          {scrollList.map((scroll, index) => (
            <tr
              key={scroll.name}
              className={`w-12 p-1${index % 2 !== 0 && ' bg-gray-50'}`}
            >
              <td className="p-4">{scroll.name}</td>
              {stat.map((name) => (
                <td key={name} className="p-4 text-right">
                  {scroll.growthRate[name]}
                </td>
              ))}
              <td className="p-4 text-center">
                <input
                  type="checkbox"
                  onChange={handleOnSelectScroll(scroll)}
                />
              </td>
            </tr>
          ))}

          <tr>
            <td colSpan={11}>&nbsp;</td>
          </tr>

          <tr>
            <td className="p-4">Character Growth Rate</td>
            {stat.map((name) => (
              <td key={name} className="p-4">
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
            <td className="p-4">Total</td>
            {stat.map((name) => (
              <td key={name} className="p-4 text-right">
                {sumGrowthRate(name, charGrowthRate, selectedScroll)}
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

function sumGrowthRate(statName, charGrowthRate, selectedScroll) {
  const baseGrowthRate = charGrowthRate[statName]
  let result = baseGrowthRate || 0

  for (const scrollName in selectedScroll) {
    const scrollData = selectedScroll[scrollName]

    result += scrollData.growthRate[statName]
      ? scrollData.growthRate[statName]
      : 0
  }

  return result
}
