export interface City {
  name: string;
  latitude: number;
  longitude: number;
  url_name: string;
}

export const topCities: City[] = [
  {
    name: "Αθήνα",
    latitude: 37.9838,
    longitude: 23.7275,
    url_name: "athina",
  },
  {
    name: "Θεσσαλονίκη",
    latitude: 40.6401,
    longitude: 22.9444,
    url_name: "thessaloniki",
  },
  {
    name: "Πάτρα",
    latitude: 38.2466,
    longitude: 21.7346,
    url_name: "patra",
  },
  {
    name: "Ηράκλειο",
    latitude: 35.3387,
    longitude: 25.1442,
    url_name: "irakleio",
  },
  {
    name: "Λάρισα",
    latitude: 39.639,
    longitude: 22.4196,
    url_name: "larisa",
  },
  // λαμία
  {
    name: "Λαμία",
    latitude: 38.9,
    longitude: 22.4333,
    url_name: "lamia",
  },
  {
    name: "Πειραιάς",
    latitude: 37.942,
    longitude: 23.6462,
    url_name: "peiraias",
  },
  {
    name: "Βόλος",
    latitude: 39.3622,
    longitude: 22.9422,
    url_name: "bolos",
  },
  {
    name: "Ιωάννινα",
    latitude: 39.6675,
    longitude: 20.8508,
    url_name: "ioannina",
  },
  {
    name: "Τρίκαλα",
    latitude: 39.5553,
    longitude: 21.767,
    url_name: "trikala",
  },
  {
    name: "Σέρρες",
    latitude: 41.0851,
    longitude: 23.5476,
    url_name: "serres",
  },
  {
    name: "Χαλκίδα",
    latitude: 38.4636,
    longitude: 23.6123,
    url_name: "xalkida",
  },
  {
    name: "Ρόδος",
    latitude: 36.4341,
    longitude: 28.2176,
    url_name: "rodos",
  },
  {
    name: "Χίος",
    latitude: 38.3683,
    longitude: 26.1358,
    url_name: "xios",
  },
  {
    name: "Κως",
    latitude: 36.8932,
    longitude: 27.2877,
    url_name: "kos",
  },
  {
    name: "Κέρκυρα",
    latitude: 39.6243,
    longitude: 19.9217,
    url_name: "kerkyra",
  },
  {
    name: "Κομοτηνή",
    latitude: 41.1172,
    longitude: 25.414,
    url_name: "komotini",
  },
  {
    name: "Νάξος",
    latitude: 37.1031,
    longitude: 25.3763,
    url_name: "naksos",
  },
  {
    name: "Καβάλα",
    latitude: 40.9399,
    longitude: 24.4018,
    url_name: "kabala",
  },
  {
    name: "Αλεξανδρούπολη",
    latitude: 40.8475,
    longitude: 25.8744,
    url_name: "aleksandroypoli",
  },
  {
    name: "Χανιά",
    latitude: 35.5138,
    longitude: 24.018,
    url_name: "xania",
  },
  {
    name: "Κατερίνη",
    latitude: 40.2719,
    longitude: 22.5025,
    url_name: "katerini",
  },
  {
    name: "Αγρίνιο",
    latitude: 38.6214,
    longitude: 21.4077,
    url_name: "agrinio",
  },
  {
    name: "Καλαμάτα",
    latitude: 37.0389,
    longitude: 22.1142,
    url_name: "kalamata",
  },
  {
    name: "Καρδίτσα",
    latitude: 39.3643,
    longitude: 21.9217,
    url_name: "karditsa",
  },
  {
    name: "Ρέθυμνο",
    latitude: 35.3682,
    longitude: 24.482,
    url_name: "rethymno",
  },
  {
    name: "Πτολεμαΐδα",
    latitude: 40.514,
    longitude: 21.6788,
    url_name: "ptolemaida",
  },
] as const;
