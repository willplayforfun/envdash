
Let's imagine the broad user journey of someone interacting with the dashboard, in its minimal version.

Landing Experience: User arrives at a global map showing environmental health impacts as color-coded overlays or heat maps. Maybe they see PM2.5 levels by default, with a legend showing "QALYs lost per 100k population" in different shades of red.

Exploration Flow:

1. Geographic Selection - User clicks on their city/region, or uses a search bar to find "Seattle" or "Mumbai"
2. Localized Dashboard - Map zooms to their area, sidebar shows the environmental health risks for that specific location with QALY impact scores
3. Factor Deep-dive - User clicks on "Air Pollution" and sees: local PM2.5 trends over time, which sources contribute most (traffic, industry, wildfires), projected health impacts for different demographics. They can click on any source (e.g. traffic) and see a description, as well as links to other environmental impacts from that source (e.g. go to a noise pollution overview).

So there are several types of "pages":
- Environmental Problem
  - This typically displays a geographic dataset, possibly with a time series as well. In any case, it contains *some* sort of data.
  - It has an associated text document that explains the problem.
  - It links to other problems (e.g. "ocean acidification" links to "coral bleaching") and also its causes ("PM2.5 pollution" links to "gas automobiles").
  - Datasets may link to sub-datasets, like "PM2.5 pollution" linking to "PM2.5 pollution produced by gas automobiles")
- Problem Cause
  - This is primarily a text document explaining the thing that contributes to an environmental problem (e.g. "gas automobiles").
  - This can link to other causes (which may be super- or sub-causes), like how "gas automobiles" may link up to into "internal combustion vehicles".
  - This can link to env problems, for example "PM2.5 produced by gas automobiles"
- Primer
  - This is an explanatory text document that may explain the research behind a link between problem and cause, or ongoing efforts to understand a problem or a cause, or perhaps efforts to remediate problems.
- Geographic Overview
  - Given a location or region, it displays a full list of the problems impacting the area's population. Ultimately seeing calculations like "In your zip code, air pollution reduces average life expectancy by 8.3 months" hits differently than global statistics. Seeing which problems are causing the biggest impact to human existence and their sources.


