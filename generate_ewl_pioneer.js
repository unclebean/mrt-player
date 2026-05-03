import fs from 'fs';

function dist(p1, p2) { return Math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2); }

function filletSmooth(pts, radius) {
  if (pts.length < 3) return pts;
  const result = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const pPrev = pts[i-1], pCurr = pts[i], pNext = pts[i+1];
    const dPrev = dist(pPrev, pCurr), dNext = dist(pCurr, pNext);
    const r = Math.min(radius, dPrev/2.1, dNext/2.1);
    const vPrev = [(pPrev[0]-pCurr[0])/dPrev, (pPrev[1]-pCurr[1])/dPrev];
    const vNext = [(pNext[0]-pCurr[0])/dNext, (pNext[1]-pCurr[1])/dNext];
    const startPt = [pCurr[0] + vPrev[0]*r, pCurr[1] + vPrev[1]*r], endPt = [pCurr[0] + vNext[0]*r, pCurr[1] + vNext[1]*r];
    result.push(startPt);
    const segs = 10;
    for (let j = 1; j < segs; j++) {
      const t = j / segs;
      result.push([(1-t)**2*startPt[0]+2*(1-t)*t*pCurr[0]+t**2*endPt[0], (1-t)**2*startPt[1]+2*(1-t)*t*pCurr[1]+t**2*endPt[1]]);
    }
    result.push(endPt);
  }
  result.push(pts[pts.length - 1]);
  return result;
}

const CX = 1000;
const CY = 800;
const R = 400;

function pt(angle) {
    const rad = angle * Math.PI / 180;
    return [CX + R * Math.cos(rad), CY + R * Math.sin(rad)];
}

const tailPoints = [
    { pt: [900, 850], name: "Dhoby Ghaut", code: "CC1" },
    { pt: [1000, 950], name: "Bras Basah", code: "CC2" },
    { pt: [1100, 1050], name: "Esplanade", code: "CC3" }
];

const fullPathPts = tailPoints.map(t => t.pt);
for(let angle = 60; angle >= -300; angle -= 2) {
    fullPathPts.push(pt(angle));
}

let cclTotalLength = 0;
const cclAccLengths = [0];
for(let i=0; i<fullPathPts.length-1; i++) {
    cclTotalLength += dist(fullPathPts[i], fullPathPts[i+1]);
    cclAccLengths.push(cclTotalLength);
}

function findProgress(stationPt, pts, acc, len) {
    let minD = Infinity;
    let closestProgress = 0;
    for(let i=0; i<pts.length-1; i++) {
        const p1 = pts[i], p2 = pts[i+1];
        const d12 = dist(p1, p2);
        const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
        const t = Math.max(0, Math.min(1, ((stationPt[0] - p1[0])*dx + (stationPt[1] - p1[1])*dy) / (d12*d12 || 1)));
        const proj = [p1[0] + t*dx, p1[1] + t*dy];
        const d = dist(stationPt, proj);
        if (d < minD) {
            minD = d;
            closestProgress = (acc[i] + t*d12) / len;
        }
    }
    return closestProgress;
}

const cclNames = [
    "Promenade", "Nicoll Highway", "Stadium", "Mountbatten", "Dakota", "Paya Lebar",
    "MacPherson", "Tai Seng", "Bartley", "Serangoon", "Lorong Chuan", "Bishan",
    "Marymount", "Caldecott", "Botanic Gardens", "Farrer Road", "Holland Village",
    "Buona Vista", "one-north", "Kent Ridge", "Haw Par Villa", "Pasir Panjang", "Labrador Park",
    "Telok Blangah", "HarbourFront"
];
const cclCodes = [
    "CC4", "CC5", "CC6", "CC7", "CC8", "CC9",
    "CC10", "CC11", "CC12", "CC13", "CC14", "CC15",
    "CC16", "CC17", "CC19", "CC20", "CC21",
    "CC22", "CC23", "CC24", "CC25", "CC26", "CC27",
    "CC28", "CC29"
];

function lerpAngle(start, end, steps) {
    const res = [];
    for(let i=0; i<=steps; i++) res.push(start + (end - start) * (i / steps));
    return res;
}

const circleAngles = [
    ...lerpAngle(60, 0, 5).slice(0, -1),
    ...lerpAngle(0, -90, 6).slice(0, -1),
    ...lerpAngle(-90, -180, 6).slice(0, -1), 
    ...lerpAngle(-180, -240, 7)
];

const cclStations = [];
for (let t of tailPoints) {
    cclStations.push({ name: t.name, code: t.code, progress: findProgress(t.pt, fullPathPts, cclAccLengths, cclTotalLength) });
}
for (let i=0; i<circleAngles.length; i++) {
    const p = pt(circleAngles[i]);
    cclStations.push({ name: cclNames[i], code: cclCodes[i], progress: findProgress(p, fullPathPts, cclAccLengths, cclTotalLength) });
}

// Add closing loop stations
cclStations.push({ name: "Keppel", code: "CC30", progress: findProgress(pt(-247.5), fullPathPts, cclAccLengths, cclTotalLength) });
cclStations.push({ name: "Cantonment", code: "CC31", progress: findProgress(pt(-255), fullPathPts, cclAccLengths, cclTotalLength) });
cclStations.push({ name: "Prince Edward Road", code: "CC32", progress: findProgress(pt(-262.5), fullPathPts, cclAccLengths, cclTotalLength) });
cclStations.push({ name: "Marina Bay", code: "CC33", progress: findProgress(pt(-270), fullPathPts, cclAccLengths, cclTotalLength) });
cclStations.push({ name: "Bayfront", code: "CC34", progress: findProgress(pt(-285), fullPathPts, cclAccLengths, cclTotalLength) });
cclStations.push({ name: "Promenade", code: "CC4", progress: findProgress(pt(-300), fullPathPts, cclAccLengths, cclTotalLength) });

cclStations.sort((a,b) => a.progress - b.progress);

const cclLine = {
    id: "ccl",
    name: "CCL",
    code: "CCL",
    colorVar: "var(--ccl-color)",
    path: fullPathPts.map((p, i) => `${i===0?'M':'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' '),
    length: Math.round(cclTotalLength),
    stations: cclStations
};

// NSL LOGIC
const nslCorners = [
  [400, 700],   // Start (Jurong East)
  [400, 200],   // Top-Left corner 1
  [500, 100],   // Top-Left corner 2
  [900, 100],   // Top-Right corner 1
  [1000, 200],  // Top-Right corner 2
  [1000, 500],  // Bishan/Novena curve
  [850, 650],   // Newton curve
  [850, 800],   // Orchard/Somerset curve
  [1000, 950],  // Dhoby Ghaut curve
  [1000, 1250]  // City Hall to Marina South Pier
];

const nslStations = {
  "Jurong East": { pt: [400, 700], code: "NS1" },
  "Bukit Batok": { pt: [400, 620], code: "NS2" },
  "Bukit Gombak": { pt: [400, 540], code: "NS3" },
  "Choa Chu Kang": { pt: [400, 460], code: "NS4" },
  "Yew Tee": { pt: [400, 380], code: "NS5" },
  "Kranji": { pt: [400, 300], code: "NS7" },
  "Marsiling": { pt: [450, 150], code: "NS8" },
  "Woodlands": { pt: [550, 100], code: "NS9" },
  "Admiralty": { pt: [630, 100], code: "NS10" },
  "Sembawang": { pt: [710, 100], code: "NS11" },
  "Canberra": { pt: [790, 100], code: "NS12" },
  "Yishun": { pt: [870, 100], code: "NS13" },
  "Khatib": { pt: [950, 150], code: "NS14" },
  "Yio Chu Kang": { pt: [1000, 250], code: "NS15" },
  "Ang Mo Kio": { pt: [1000, 320], code: "NS16" },
  "Bishan": { pt: [1000, 400], code: "NS17" },
  "Braddell": { pt: [1000, 440], code: "NS18" },
  "Toa Payoh": { pt: [1000, 470], code: "NS19" },
  "Novena": { pt: [1000, 500], code: "NS20" },
  "Newton": { pt: [925, 575], code: "NS21" },
  "Orchard": { pt: [850, 700], code: "NS22" },
  "Somerset": { pt: [850, 750], code: "NS23" },
  "Dhoby Ghaut": { pt: [900, 850], code: "NS24" }, 
  "City Hall": { pt: [1000, 1000], code: "NS25" },
  "Raffles Place": { pt: [1000, 1050], code: "NS26" },
  "Marina Bay": { pt: [1000, 1200], code: "NS27" },
  "Marina South Pier": { pt: [1000, 1250], code: "NS28" }
};

function buildLine(id, name, color, corners, stationDict, radius = 40) {
  const smoothPts = filletSmooth(corners, radius);
  let totalLength = 0;
  const accLengths = [0];
  for(let i=0; i<smoothPts.length-1; i++) {
    totalLength += dist(smoothPts[i], smoothPts[i+1]);
    accLengths.push(totalLength);
  }
  const stations = [];
  for(const [sname, data] of Object.entries(stationDict)) {
    stations.push({ name: sname, code: data.code, progress: findProgress(data.pt, smoothPts, accLengths, totalLength) });
  }
  stations.sort((a,b) => a.progress - b.progress);
  return {
    id: id, name: name, code: name, colorVar: color,
    path: smoothPts.map((p, i) => `${i===0?'M':'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' '),
    length: Math.round(totalLength), stations: stations
  };
}

const nslLine = buildLine("nsl", "NSL", "var(--nsl-color)", nslCorners, nslStations, 40);

// EWL LOGIC
// Pioneer (EW28) is at x=80, where it corners UP to Tuas Link
const ewlCorners = [
  [80, 400],     // Tuas Link (EW33)
  [80, 800],     // Pioneer (EW28) curve
  [300, 800],    // Chinese Garden (EW25) curve
  [400, 700],    // Jurong East peak (NS1)
  [500, 800],    // Clementi curve
  [600, 800],    // Buona Vista (CC22)
  [850, 1050],   // Outram Park curve
  [1000, 1050],  // Raffles Place (NS26)
  [1000, 1000],  // City Hall (NS25)
  [1200, 800],   // Bugis curve
  [1400, 800],   // Paya Lebar (CC9)
  [1600, 800],   // Tanah Merah
  [1750, 650]    // Pasir Ris
];

const ewlStations = {
  "Tuas Link": { pt: [80, 400], code: "EW33" },
  "Tuas West Road": { pt: [80, 480], code: "EW32" },
  "Tuas Crescent": { pt: [80, 560], code: "EW31" },
  "Gul Circle": { pt: [80, 640], code: "EW30" },
  "Joo Koon": { pt: [80, 720], code: "EW29" },
  "Pioneer": { pt: [80, 800], code: "EW28" },
  "Boon Lay": { pt: [140, 800], code: "EW27" },
  "Lakeside": { pt: [200, 800], code: "EW26" },
  "Chinese Garden": { pt: [260, 800], code: "EW25" },
  "Jurong East": { pt: [400, 700], code: "EW24" }, // Intersect NS1
  "Clementi": { pt: [460, 760], code: "EW23" },
  "Dover": { pt: [540, 800], code: "EW22" },
  "Buona Vista": { pt: [600, 800], code: "EW21" }, // Intersect CC22
  "Commonwealth": { pt: [660, 860], code: "EW20" },
  "Queenstown": { pt: [720, 920], code: "EW19" },
  "Redhill": { pt: [780, 980], code: "EW18" },
  "Tiong Bahru": { pt: [850, 1050], code: "EW17" },
  "Outram Park": { pt: [900, 1050], code: "EW16" },
  "Tanjong Pagar": { pt: [950, 1050], code: "EW15" },
  "Raffles Place": { pt: [1000, 1050], code: "EW14" }, // Intersect NS26
  "City Hall": { pt: [1000, 1000], code: "EW13" },   // Intersect NS25
  "Bugis": { pt: [1100, 900], code: "EW12" },
  "Lavender": { pt: [1160, 840], code: "EW11" },
  "Kallang": { pt: [1230, 800], code: "EW10" },
  "Aljunied": { pt: [1310, 800], code: "EW9" },
  "Paya Lebar": { pt: [1400, 800], code: "EW8" },    // Intersect CC9
  "Eunos": { pt: [1450, 800], code: "EW7" },
  "Kembangan": { pt: [1500, 800], code: "EW6" },
  "Bedok": { pt: [1550, 800], code: "EW5" },
  "Tanah Merah": { pt: [1600, 800], code: "EW4" },
  "Simei": { pt: [1650, 750], code: "EW3" },
  "Tampines": { pt: [1700, 700], code: "EW2" },
  "Pasir Ris": { pt: [1750, 650], code: "EW1" }
};

const ewlLine = buildLine("ewl", "EWL", "var(--ewl-color)", ewlCorners, ewlStations, 40);

// CGL LOGIC (Changi Branch)
const cglCorners = [
  [1600, 800],  // Tanah Merah
  [1750, 950]   // Changi Airport
];

const cglStations = {
  "Tanah Merah": { pt: [1600, 800], code: "" }, // Already EW4, but need it on the line
  "Expo": { pt: [1675, 875], code: "CG1" },
  "Changi Airport": { pt: [1750, 950], code: "CG2" }
};

const cglLine = buildLine("cgl", "CGL", "var(--ewl-color)", cglCorners, cglStations, 40);

const lines = [ cclLine, nslLine, ewlLine, cglLine ];
fs.writeFileSync('src/constants.ts', `import type { MrtLine } from './types';\n\nexport const MRT_LINES: MrtLine[] = ${JSON.stringify(lines, null, 2)};\n`, 'utf8');
console.log("EWL West Hook corrected to Pioneer!");
