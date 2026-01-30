# Issues Monitor Dashboard

A simple, single-page dashboard application for displaying issues monitoring data retrieved via API key authentication.

## Features

- Clean, minimalist design with WEC branding
- Real-time data visualization using Nivo charts
- Data fetching via secure API key authentication
- Multiple chart types:
  - Gender distribution (pie chart)
  - Age group distribution (pie chart)
  - Sectors (bar chart)
  - Organization stages (bar chart)
  - Roles (bar chart)
  - Energy focus (radar & pie charts)

## Usage

The application expects data to be fetched from an API endpoint using a key provided in the URL query parameter:

```
https://yourdomain.com/?key=YOUR_API_KEY
```

The application will automatically fetch the data when loaded and display it in the dashboard.

## Data Format

The API endpoint should return JSON data in the following format:

```json
[
  {
    "COUNTRY": "Country Name",
    "GENDER": "Male/Female/Other",
    "AGE_GROUP": "18-25",
    "SECTOR": "Technology",
    "ORGANISATION_STAGE": "Early Stage",
    "ROLE": "Developer",
    "ENERGY_FOCUS": "Solar",
    "STATE_PROVINCE": "State/Province",
    "REGION": "Region"
  },
  ...
]
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

This generates optimized files in the `dist` directory.

## Deployment to GitHub Pages

To deploy to GitHub Pages:

1. Update the `vite.config.ts` file with your repository name
2. Push code to your GitHub repository
3. The GitHub Actions workflow will automatically build and deploy

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **Nivo Charts** - Data visualization
- **CSS** - Styling

## License

proprietary
