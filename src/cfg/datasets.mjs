
export const DATASETS = {
	NATURAL_EARTH: {
		name: "Natural Earth Boundaries",
		description: "Global country, state/province, and county boundaries from Natural Earth. Public domain data optimized for web mapping.",
		
		file_prefix: "naturalearth_",
		downloads: [
			{
			  url: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
			  filename: 'countries.json',
			  description: 'Country boundaries (110m scale)'
			},
			{
			  url: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces_lakes.geojson',
			  filename: 'states.json',
			  description: 'State/province boundaries (50m scale)'
			},
			{
			  url: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_2_counties.geojson  ',
			  filename: 'counties.json',
			  description: 'County boundaries (10m scale, limited coverage)'
			}
		]
	}
};
