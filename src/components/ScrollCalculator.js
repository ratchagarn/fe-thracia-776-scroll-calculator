import { useState, useEffect, useRef } from 'react'
import classNames from 'classnames'

import ScrollImage from './ScrollImage'

import scroll from '../scroll.json'

const STORAGE_VERSION = 1

const STAT_LIST = ['HP', 'STR', 'MAG', 'SKL', 'SPD', 'LCK', 'DEF', 'CON', 'MOV']
const MAXIMUM_SELECTED_SCROLL = 7
const storageName = {
  version: 'fe-thracia-776-scroll-calculator:version',
  selectedScroll: 'fe-thracia-776-scroll-calculator:selectedScroll',
  charGrowthRate: 'fe-thracia-776-scroll-calculator:charGrowthRate',
}

const scrollList = Object.keys(scroll).map((name) => ({
  name,
  ...scroll[name],
}))

function ScrollCalculator() {
  const charGrowthRateRenderTime = useRef(new Date().getTime())

  const [selectedScroll, setSelectedScroll] = useState(
    getInitialSelectedScroll()
  )
  const [charGrowthRate, setCharGrowthRate] = useState(
    getInitialCharacterGrowthRate()
  )

  useEffect(() => {
    window.localStorage.setItem(storageName.version, STORAGE_VERSION)
  }, [])

  const countSelectedScroll = Object.keys(selectedScroll).length
  const charGrowthRateResult = calculateCharGrowthRateResult(
    selectedScroll,
    charGrowthRate
  )

  return (
    <div className="container mx-auto p-2">
      <h1 className="font-bold text-xl mb-4">
        Fire Emblem Thracia 776 Scroll Calculator
      </h1>
      <hr />

      <table className="table-auto mt-4 rounded-sm border-2 border-gray-100">
        <caption>
          Selected scroll count:
          <span
            className={classNames('ml-2', {
              'text-red-700 font-bold':
                countSelectedScroll >= MAXIMUM_SELECTED_SCROLL,
            })}
          >
            {countSelectedScroll}/{MAXIMUM_SELECTED_SCROLL}
            <a
              href="#reset"
              className="ml-4 text-sm text-blue-500 hover:underline"
              onClick={handleAllReset}
            >
              [Reset]
            </a>
          </span>
        </caption>
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left" colSpan={2} style={{ width: 240 }}>
              Scroll Name
            </th>
            {STAT_LIST.map((name) => (
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
                <td className="p-2" style={{ width: 32 }}>
                  <ScrollImage name={scroll.name} />
                </td>
                <td className="p-2 font-bold">{scroll.name}</td>
                {STAT_LIST.map((name) => {
                  const growthRate = scroll[name]
                  return (
                    <td
                      key={name}
                      className={classNames('p-2 text-right', {
                        'text-gray-300': growthRate === 0,
                        'bg-red-600 text-white font-bold': growthRate < 0,
                        'bg-green-200 font-bold': growthRate > 0,
                        'bg-green-600 text-white font-bold': growthRate > 10,
                      })}
                    >
                      {growthRate === 0 ? '-' : `${growthRate}%`}
                    </td>
                  )
                })}
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    onChange={handleOnSelectScroll(scroll)}
                    checked={isSelected}
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
            <td className="p-2" colSpan={2}></td>
            {STAT_LIST.map((name) => (
              <td key={name} className="p-2 text-right font-bold">
                {name}
              </td>
            ))}
            <td className="p-2"></td>
          </tr>

          <tr key={charGrowthRateRenderTime.current}>
            <td className="p-2 text-sm font-bold" colSpan={2}>
              Character Growth Rate (%)
            </td>
            {STAT_LIST.map((name) => (
              <td key={name} className="py-2">
                <input
                  type="text"
                  className="w-16 border-2 border-gray-200 rounded-sm px-2 py-1 text-right"
                  maxLength="3"
                  defaultValue={charGrowthRate[name] ? charGrowthRate[name] : 0}
                  onChange={handleOnInputCharacterGrowthRateChange(name)}
                  onKeyPress={handleOnInputCharacterGrowthRatePress}
                />
              </td>
            ))}
            <td className="text-center">
              <span
                className="cursor-pointer"
                onClick={handleOnResetCharacterGrowthRate}
              >
                ✖
              </span>
            </td>
          </tr>
          <tr>
            <td className="p-2 font-bold" colSpan={2}>
              TOTAL
            </td>
            {STAT_LIST.map((name) => {
              const base = charGrowthRate[name]
              const result = charGrowthRateResult[name]

              return (
                <td key={name} className="p-2 text-right">
                  <span
                    className={classNames({
                      'text-red-600': result < base,
                      'text-green-600': result > base,
                      'font-bold': result !== base,
                    })}
                  >
                    {result}%
                  </span>
                </td>
              )
            })}
            <td>&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>
  )

  function handleOnSelectScroll(scrollData) {
    return ({ target: checked }) => {
      const handleSetSelectedScroll = (prevState) => {
        let result = { ...prevState }

        if (checked && prevState[scrollData.name]) {
          const newState = {}

          for (const scrollName in prevState) {
            if (scrollName !== scrollData.name) {
              newState[scrollName] = prevState[scrollName]
            }
          }

          result = newState
          window.localStorage.setItem(
            storageName.selectedScroll,
            JSON.stringify(result)
          )
        } else if (checked) {
          result = {
            ...prevState,
            [scrollData.name]: scrollData,
          }

          window.localStorage.setItem(
            storageName.selectedScroll,
            JSON.stringify(result)
          )
        }

        return result
      }

      setSelectedScroll(handleSetSelectedScroll)
    }
  }

  function handleOnInputCharacterGrowthRatePress(event) {
    const char = String.fromCharCode(event.charCode)

    if (!isNumber(char)) {
      event.preventDefault()
    }
  }

  function handleOnInputCharacterGrowthRateChange(statName) {
    return ({ target: { value } }) => {
      setCharGrowthRate((state) => {
        const result = {
          ...state,
          [statName]: adjustCharacterGrowthRate(value),
        }

        window.localStorage.setItem(
          storageName.charGrowthRate,
          JSON.stringify(result)
        )

        return result
      })
    }
  }

  function handleAllReset() {
    if (window.confirm('Do you want to reaet all?')) {
      window.localStorage.clear()
      setSelectedScroll(getInitialSelectedScroll())
      setCharGrowthRate(getInitialCharacterGrowthRate())
      doReRenderCharGrowthRate()
    }
  }

  function handleOnResetCharacterGrowthRate() {
    if (window.confirm('Do you want to reset Character Growth Rate?')) {
      window.localStorage.removeItem(storageName.charGrowthRate)
      setCharGrowthRate(getInitialCharacterGrowthRate())
      doReRenderCharGrowthRate()
    }
  }

  function doReRenderCharGrowthRate() {
    charGrowthRateRenderTime.current = new Date().getTime()
  }
}

export default ScrollCalculator

function getInitialSelectedScroll() {
  const storageData = window.localStorage.getItem(storageName.selectedScroll)

  const result = storageData ? JSON.parse(storageData) : {}

  return result
}

function getInitialCharacterGrowthRate() {
  let result = {}
  const storageData = window.localStorage.getItem(storageName.charGrowthRate)

  if (storageData) {
    result = JSON.parse(storageData)
  }

  STAT_LIST.forEach((name) => {
    result[name] = isNumber(result[name]) ? Number(result[name]) : 0
  })

  return result
}

function adjustCharacterGrowthRate(rate) {
  if (!isNumber(rate)) {
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
  const result = {}

  STAT_LIST.forEach((name) => {
    result[name] = isNumber(charGrowthRate[name])
      ? Number(charGrowthRate[name])
      : 0
  })

  for (const scrollName in selectedScroll) {
    const scrollData = selectedScroll[scrollName]

    for (const key in scrollData) {
      if (key !== 'name') {
        result[key] += isNumber(scrollData[key]) ? Number(scrollData[key]) : 0
      }
    }
  }

  return result
}

function isNumber(v) {
  return /^-?[0-9]+$/.test(v)
}
