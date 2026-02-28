/**
 * Nepal's 7 provincial administrative divisions mapped to their constituent
 * districts.  District names here match those stored inside
 * `public/data/constituencies.json` (and derivable from candidates.json IDs).
 *
 * Constituency IDs follow the lowercase-hyphen pattern used across the app,
 * e.g. "jhapa-1", "kathmandu-3", "nawalparasi-east-1".
 */

export interface NepalProvince {
  name: string;
  districts: string[];
}

export const NEPAL_PROVINCES: NepalProvince[] = [
  {
    name: "Koshi",
    districts: [
      "Bhojpur",
      "Dhankuta",
      "Ilam",
      "Jhapa",
      "Khotang",
      "Morang",
      "Okhaldhunga",
      "Panchthar",
      "Sankhuwasabha",
      "Solukhumbu",
      "Sunsari",
      "Taplejung",
      "Terhathum",
      "Udayapur",
    ],
  },
  {
    name: "Madhesh",
    districts: [
      "Bara",
      "Dhanusha",
      "Mahottari",
      "Parsa",
      "Rautahat",
      "Saptari",
      "Sarlahi",
      "Siraha",
    ],
  },
  {
    name: "Bagmati",
    districts: [
      "Bhaktapur",
      "Chitwan",
      "Dhading",
      "Dolakha",
      "Kavrepalanchok",
      "Kathmandu",
      "Lalitpur",
      "Makwanpur",
      "Nuwakot",
      "Ramechhap",
      "Rasuwa",
      "Sindhuli",
      "Sindhupalchow",
    ],
  },
  {
    name: "Gandaki",
    districts: [
      "Baglung",
      "Gorkha",
      "Kaski",
      "Lamjung",
      "Manang",
      "Mustang",
      "Myagdi",
      "Nawalparasi East",
      "Parbat",
      "Syangja",
      "Tanahun",
    ],
  },
  {
    name: "Lumbini",
    districts: [
      "Arghakhanchi",
      "Banke",
      "Bardiya",
      "Dang",
      "Gulmi",
      "Kapilvastu",
      "Nawalparasi West",
      "Palpa",
      "Pyuthan",
      "Rolpa",
      "Rupandehi",
    ],
  },
  {
    name: "Karnali",
    districts: [
      "Dailekh",
      "Dolpa",
      "Humla",
      "Jajarkot",
      "Jumla",
      "Kalikot",
      "Mugu",
      "Rukum West",
      "Salyan",
      "Surkhet",
    ],
  },
  {
    name: "Sudurpashchim",
    districts: [
      "Achham",
      "Baitadi",
      "Bajhang",
      "Bajura",
      "Dadeldhura",
      "Darchula",
      "Doti",
      "Kailali",
      "Kanchanpur",
      "Rukum East",
    ],
  },
];

/**
 * Derive the district name from a constituency ID such as "jhapa-1" or
 * "nawalparasi-east-1".  The last hyphen-segment is always the constituency
 * number so everything before it is the district (words title-cased and
 * space-joined).
 */
export function districtFromConstituencyId(id: string): string {
  const parts = id.split("-");
  parts.pop(); // remove trailing number
  return parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/**
 * Return the province name for a given district, or empty string if unknown.
 */
export function provinceForDistrict(district: string): string {
  return (
    NEPAL_PROVINCES.find((p) =>
      p.districts.some((d) => d.toLowerCase() === district.toLowerCase()),
    )?.name ?? ""
  );
}
