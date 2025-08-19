

I think it would be helpful to build an interactive dashboard that shows the various parts of the climate and environment issues facing humanity, and how they relate to each other numerically.
Examples:
- Climate Change
- Habitat Loss / Mass Extinction / Biodiversity loss / Invasive Species
- Microplastics/PFAS
- Water pollution
- Air pollution
- Ocean acidification
- Ozone depletion

These issues are deeply interconnected - for example, climate change accelerates species extinction, while deforestation reduces carbon sequestration capacity. Microplastics affect marine food webs, which impacts both biodiversity and human food security. And within each domain, there are many overlapping issues. 

Being able to visually explore data-driven representations of these issues would be helpful. For example, having climate changes broken into greenhouse gas emissions, temperature rise, sea level rise, etc. Exploring:
 - the models that predict temperature rise from GHGs
 - various sources of GHGs
 - impact of temperature rise on ecosystems, human life, etc.

In each case, being able to rabbit-hole into an area and learn more about the details, and also see each problem depicted in a quantitative manner, so the user can grasp which things really are the most important to focus on.

In some cases, this means exploring models of how various things will decrease human wellbeing. For example, the disruption of ecosystems leading to lower incomes and lower foodstocks reduces well-being, but the increased heat and extreme weather also directly reduces well-being.

Otherwise, it's impossible to compare soil erosion to invasive species to GHGs.

Quality-Adjusted Life Years (QALYs) is a solid anchor point because it captures both mortality and morbidity impacts. For environmental issues, you'd need to trace through causal chains like:

- Air pollution → respiratory disease, cardiovascular disease → reduced life expectancy and quality

- Climate change → heat stress, vector-borne diseases, food insecurity, displacement → health impacts

- Water contamination → infectious diseases, cancer, developmental issues → QALYs lost

- Biodiversity loss → reduced ecosystem services → food security, disease regulation, mental health impacts

Alternative/complementary metrics that might work alongside QALYs:
- Disability-Adjusted Life Years (DALYs) - WHO's preferred metric
- Economic impact (GDP loss, healthcare costs, productivity loss)
- Years of life lost or life expectancy reduction
- Wellbeing indices that capture broader quality of life factors

The tricky part is quantifying indirect pathways. How do you measure the QALY impact of losing 10% of pollinators? You'd need to trace through: reduced crop yields → nutrition impacts → health outcomes, plus economic stress pathways.

Organizations like the Global Burden of Disease project and environmental health economists have done some of this work, but it's still fragmentary. For this dashboard, we will start with the clearer direct health impacts (air/water pollution) and gradually build in the more complex pathways.

The easiest starting points would probably be:
- Air pollution - tons of epidemiological data linking PM2.5, NO2, ozone levels to specific health outcomes. The WHO and health economists have done extensive QALY/DALY calculations here.
- Water contamination - well-established dose-response relationships for things like lead, arsenic, bacterial contamination, and their health impacts.
- Climate-related heat stress - direct temperature-mortality relationships are pretty well documented, especially for extreme heat events.

See the UserJourney.md doc for an example of how the user actual interacts with this dashboard.