export type AqiCategory = {
  label: string
  /** 0 (Good) to 5 (Hazardous); drives the color and the shape of the indicator. */
  level: 0 | 1 | 2 | 3 | 4 | 5
  note: string
}

const CATEGORIES: Array<{ max: number; category: AqiCategory }> = [
  {
    max: 50,
    category: { label: 'Good', level: 0, note: 'Air quality is great. Enjoy time outside.' },
  },
  {
    max: 100,
    category: {
      label: 'Moderate',
      level: 1,
      note: 'Fine for most. Unusually sensitive people may want to take it easy outdoors.',
    },
  },
  {
    max: 150,
    category: {
      label: 'Unhealthy for sensitive groups',
      level: 2,
      note: 'Children, older adults and people with asthma should limit long outdoor effort.',
    },
  },
  {
    max: 200,
    category: {
      label: 'Unhealthy',
      level: 3,
      note: 'Everyone may feel effects. Cut back on strenuous outdoor activity.',
    },
  },
  {
    max: 300,
    category: {
      label: 'Very unhealthy',
      level: 4,
      note: 'Avoid outdoor exercise and keep windows closed if you can.',
    },
  },
  {
    max: Infinity,
    category: {
      label: 'Hazardous',
      level: 5,
      note: 'Health emergency conditions. Stay indoors.',
    },
  },
]

export function getAqiCategory(aqi: number): AqiCategory {
  return (CATEGORIES.find((c) => aqi <= c.max) ?? CATEGORIES[CATEGORIES.length - 1]).category
}
