export const COLLEGES = [
  {
    id: 1,
    name: "Visvesvaraya National Institute of Technology (VNIT)",
    type: "government",
    address: "South Ambazari Road, Nagpur",
    lat: 21.1272,
    lng: 79.0522,
    courses: ["B.Tech", "M.Tech", "B.Arch"]
  },
  {
    id: 2,
    name: "Government College of Engineering, Nagpur",
    type: "government",
    address: "Sector 27, MIHAN, Nagpur",
    lat: 21.0478,
    lng: 79.0435,
    courses: ["B.Tech", "Civil", "Mechanical", "Electrical"]
  },
  {
    id: 3,
    name: "Shri Ramdeobaba College of Engineering and Management",
    type: "private",
    address: "Ramdeo Tekdi, Gittikhadan, Nagpur",
    lat: 21.1766,
    lng: 79.0617,
    courses: ["B.E", "MBA", "MCA"]
  },
  {
    id: 4,
    name: "Yeshwantrao Chavan College of Engineering (YCCE)",
    type: "private",
    address: "Wanadongri, Hingna Road, Nagpur",
    lat: 21.0967,
    lng: 78.9790,
    courses: ["B.E", "M.Tech"]
  },
  {
    id: 5,
    name: "Laxminarayan Institute of Technology (LIT)",
    type: "government",
    address: "Amravati Road, Nagpur",
    lat: 21.1444,
    lng: 79.0438,
    courses: ["B.Tech Chemical Engineering", "Food Technology"]
  },
  {
    id: 6,
    name: "G.H. Raisoni College of Engineering",
    type: "private",
    address: "Digdoh Hills, Hingna Road, Nagpur",
    lat: 21.0991,
    lng: 78.9954,
    courses: ["B.E", "B.Tech", "M.Tech"]
  }
];

export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); // Distance in km
};
