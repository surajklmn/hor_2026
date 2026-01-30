# Nepal House of Representatives Election Map 2026

An interactive web application to visualize Nepal's 165 House of Representatives constituencies with candidate information.

## Features

- 🗺️ Interactive map of all 165 HoR constituencies
- 🔍 Search constituencies by district name
- 👥 View candidates for each constituency
- 📍 Protected areas overlay (National Parks & Wildlife Reserves)
- 📱 Responsive design

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (React)
- **Mapping**: [Leaflet](https://leafletjs.com/)
- **Styling**: CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/[your-username]/hor_2026.git
cd hor_2026

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build for Production

```bash
npm run build
npm start
```

## Data Structure

### Geographic Data (`public/data/`)

| File | Description |
|------|-------------|
| `nepal_constituencies.geojson` | GeoJSON boundaries for all 165 HoR constituencies |
| `nepal_municipalities.geojson` | GeoJSON boundaries for local levels (Municipalities/Gaunpalikas) |
| `nepal_protected_areas.geojson` | GeoJSON boundaries for national parks and wildlife reserves |
| `candidates.json` | Candidate information for each constituency |
| `constituencies.json` | Additional constituency metadata |

### Constituency Properties

```json
{
  "id": "chitwan-2",
  "name": "Chitwan Constituency 2",
  "district": "Chitwan",
  "constituencyNumber": 2
}
```

The `id` field matches keys in `candidates.json` for easy data linking.

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/[your-username]/hor_2026)

### GitHub Pages

```bash
npm run build
npm run export
# Deploy the `out` directory
```

---

## Legal Notice & Licensing

### Project License

This project's **source code** is licensed under the [MIT License](LICENSE).

### Geographic Data License

The geographic boundary data in `public/data/` is released under the **[Open Data Commons Open Database License (ODbL) v1.0](https://opendatacommons.org/licenses/odbl/1.0/)**.

You are free to:
- **Share** — copy, distribute and use the database
- **Create** — produce works from the database  
- **Adapt** — modify, transform and build upon the database

Under the following conditions:
- **Attribution** — You must attribute any public use of the database
- **Share-Alike** — If you publicly use any adapted version, you must also offer it under ODbL

### Data Sources

- **Constituency boundaries**: Derived from publicly available electoral geographic data
- **Protected area boundaries**: Derived from publicly available conservation area maps
- **Local Level Boundaries**: Sourced from [Open Knowledge Nepal](https://localboundries.oknp.org/)

Geographic boundary data of administrative divisions is generally considered **factual information** and is not subject to copyright protection, as facts cannot be copyrighted.

### Disclaimer

> **⚠️ DISCLAIMER**: This data is provided "as is" without warranty of any kind, express or implied.
>
> - This is **NOT official government data** and should not be used for legal, administrative, or official purposes
> - Boundary accuracy may vary; for official data, refer to the [Election Commission of Nepal](https://election.gov.np/)
> - The maintainers make no claims regarding the completeness or accuracy of this data
> - Candidate information is for informational purposes only

---

## Contributing

Contributions are welcome! If you find errors in the boundary data or have improvements:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -m 'Add improvement'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

## References

- [Election Commission of Nepal](https://election.gov.np/)
- [Survey Department of Nepal](https://dos.gov.np/)

