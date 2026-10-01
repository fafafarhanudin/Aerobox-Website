export type Category =
  | "Dashboards"
  | "Web apps"
  | "Mobile apps"
  | "Landing pages"
  | "Bento & UI cards"
  | "Live websites";

export type Project = {
  index: number;
  title: string;
  tag: string;
  category: Category;
  image: string;
  height: number;
  column: 0 | 1;
  isNew?: boolean;
  url?: string;
  live?: boolean;
};

type Row = [index: number, title: string, image: string, height: number, isNew?: 1];

const img = (key: string) => `/work/${key}.webp`;

function group(
  category: Category,
  tag: string,
  columns: [Row[], Row[]],
): Project[] {
  return columns.flatMap((rows, column) =>
    rows.map(([index, title, key, height, isNew]) => ({
      index,
      title,
      tag,
      category,
      image: img(key),
      height,
      column: column as 0 | 1,
      isNew: Boolean(isNew),
    })),
  );
}

const dashboards = group("Dashboards", "Dashboard", [
  [
    [1, "Nezuko", "bd2355a49b1ca34f9662d09a2bd9c897de18e322", 462],
    [4, "BetFlow · Trade history", "dc52b77d0b5f58c2609318b0d3b3109760579443", 464, 1],
    [6, "Modelgate · Models", "7c728fd296dde9de12ef3cab3bed46140f131fc6", 466, 1],
    [8, "Lintas · Control room", "ddc7f4a0358d644c5023e52bb108a0d20d2480ca", 464, 1],
    [10, "PropelMatch", "2d33376786973fca8fc87025f32842b6e64bb004", 462],
    [12, "Aether AI · Charging ledger", "d3623714858b045c3408f9548ee83fc638eb6805", 464, 1],
    [14, "Afine", "96a7a4b3e18e1659e6b22f56d1df1adefcf456f1", 462],
    [16, "Modelgate", "7d0c2e54276817e959aa3f516cfbe6e473239723", 464, 1],
    [18, "FileDash", "ad6fa8d3429367241743e842b1b40512e01d4f75", 462, 1],
    [20, "Nezuko", "553335a4c77769a647d1e7c292a67c7688e35d10", 462],
    [22, "BetFlow · Leaderboard", "21365ea5b6be2fb9fe3466bfd6289b7fc401ca1b", 464, 1],
    [24, "BetFlow · My positions", "c028b09dc2f666efa8928fda08ee5a164cb3f871", 464, 1],
    [26, "Project overview", "0c265547f146de90271f8c8442f4bcf40d69d7d6", 462],
    [28, "Finance overview", "0ef81671e603e6d9989c0a2f8d8d42663fd4bd34", 462],
    [30, "Revenue dashboard", "237730550228b8ceb247afe359565fa357136a4e", 462],
    [32, "Developer console", "35edcc84fff63f35178335192d4cdb13df7d5be0", 462],
    [34, "Flowdesk", "1303542604337c2925568a81d0ce0afd8ac087ae", 464, 1],
    [36, "Cutmage · Templates", "7f8533446af6959a18c5c6bb7911891250c78e0f", 464, 1],
    [38, "Cutmage · Color grading", "1391c77572ace450e81071319a3a5fafa9bdd114", 466, 1],
    [40, "Cutmage · Brand kit", "636409ca8a600635b09589a2971f0f50bfd10017", 464, 1],
    [42, "Sales dashboard", "a6e3888068799ac66a2cd5e9cf4e2970414b819a", 462],
    [44, "Cutmage · Team & permissions", "448790a70111994e3340aab9d1475b9e258843a8", 464, 1],
    [46, "Cutmage · Editor", "faa86174cd7600bd4cbc8f16b71760fe9c5eda2b", 466, 1],
    [48, "Cutmage · Billing & plan", "70050d16315a226609bbd919f90e52789c7b415b", 464, 1],
    [50, "Sales dashboard", "e8c52ddac43e95f7648b0955deae6baf01322b37", 462],
    [51, "Cutmage · Media library", "f1642774364ca72f10f69270c7b660869cb1d373", 466, 1],
  ],
  [
    [2, "Modelgate · Logs", "c49df818b989fbbed34e7dbecbb99a92bf93237c", 448, 1],
    [3, "Aether AI · Parts registry", "1891e3bc23cd180ca068183aa6e7d56413764715", 464, 1],
    [5, "PropelMatch", "bc54b1f48870089d25a5259785d0f04eb400731f", 462],
    [7, "BetFlow · Markets", "8fc683b464da57bffba4759690e4e7c851ec6e04", 466, 1],
    [9, "Aether AI · Trip log", "44196930300f1698c1a6aee606e89946d269c288", 464, 1],
    [11, "Aether AI · Audit log", "df484547f5443a887cbf5cd841bd2ec2b3ba804d", 464, 1],
    [13, "Kargo", "713365b1ede16aac4b3ac9d1e59552d63e8091fe", 444, 1],
    [15, "Afine", "fb1b6ebeb77a8c61c778f9385bd3e4df13348ba8", 462],
    [17, "Afine", "8976ec191f62cfbf9efbd1db1f2ba606a9ae3c78", 462],
    [19, "Sentinel AI", "b44853a390a24f3899db5717667e44d49d2a478f", 464, 1],
    [21, "Analytics suite", "25e70dd1fbc21b2d9502cd13c8c751f904cbc61f", 464],
    [23, "Crypto portfolio", "d26a9406adbc59d560bc7722c4b92d2b4ccf0f27", 462],
    [25, "Afine", "69d6da655ddd89147e045e6e34fa94f956fd1d63", 462],
    [27, "Trading terminal", "34c1c86c5c4317dfa2990103b0736405a5b11524", 462],
    [29, "Aperture redesign", "b78ccb4511d9db9638f90c1b27c62dc67d319b85", 468, 1],
    [31, "Cutmage · Asset library", "a234608b7021bf2f86d164e014d9452ff70da292", 464, 1],
    [33, "Cutmage · Activity", "5929149945e1567fa68c9ce8a816f1a6b7d93968", 464, 1],
    [35, "Cutmage · Content calendar", "7d5e4129ba044083f4962a31041289cc8bdddb14", 464, 1],
    [37, "Automatic", "bec80f3a1843caecd369bc8a95af9a8f538aface", 462],
    [39, "Cutmage · Exports", "ea8a3e7583695b8ed0bcd8c8d048b526d5816e01", 466, 1],
    [41, "Cutmage · Review & comments", "57771f84fda079d7e09d447028c4eefda6cae76c", 464, 1],
    [43, "Cutmage · Storage & usage", "45a81b7f63c395082e6b590246fccdacd0914e48", 466, 1],
    [45, "Finance overview", "141221d6d143dd8bb382508d5c48fac3bbf465de", 466],
    [47, "Cutmage · Insights", "7a179a960f9b4f3aba03b1c833e1b5434c2d91be", 466, 1],
    [49, "Cutmage · Home", "71bda6553ccafa8d7f8e4d185032bb4e003594a6", 464, 1],
  ],
]);

const webApps = group("Web apps", "Web app", [
  [
    [52, "Connect360", "4d7a719408c6142847187bca66546fbc7381aa32", 462],
    [54, "Slack AI Agents", "00598efbb730575ed0a7c3d3afb6f38131a50589", 462, 1],
    [56, "CRM pipeline", "796221443d1b7371a90b5127ef97094050de2876", 468],
    [59, "E-course", "dac85e80c53ecdd8ee0c39a8b9986bb04f7bd933", 464],
    [61, "Job board", "6f8c22e2f3d361fc6323f3fb45906022ed9f94ae", 464],
    [63, "Team task tracker", "50b709e9705318c85b6798b5501e9fd8b22227bf", 462],
    [65, "Team task tracker", "66bbf8e5b6a47de21341d474835590953ea174ba", 464],
    [67, "Space onboarding", "590fcb2f93023ead2374f6d246cdd4f48b904b4b", 458],
    [69, "Team chat", "bf73535ba21f71fedcd5f41a412e0656c9245784", 462],
    [70, "File storage", "3979631865e9cff0bd868dfea4a22d0f8bcbc735", 462],
  ],
  [
    [53, "Connect360", "f1de9702a4e6afeb4647b4128e913d66428fbbbf", 464],
    [55, "CRM pipeline", "c753e8aa1109b292d31da3bfd475548ecfff06a0", 462],
    [57, "E-course", "ace4695ac8d70bdfbb1bdbc0be222f8c8c97e52f", 462],
    [58, "E-course", "87e72bbb2ef491b5c9cb0f504b91bd16b39e548c", 462],
    [60, "Job board", "0fe14429b887dadc68389e709b1709ac65b80a42", 462],
    [62, "Team task tracker", "d42e32eac44335c267fff79cf54f92199faef6e0", 462],
    [64, "AI photo studio", "a7f731e040f804a588980d27c21f5e9b75c323fd", 462],
    [66, "Image gallery", "2e9184ffeef237d9223828b19da9a1610b760836", 462],
    [68, "File storage", "8b117d4532b2a3dfdc71c548a2ed8296ad6dfd41", 488],
  ],
]);

const mobileApps = group("Mobile apps", "Mobile app", [
  [
    [71, "Moolah", "b4e04988c5165d6b80b15e00d7ca6e93cf9ac17b", 460],
    [74, "Stride", "stage-stride", 466, 1],
    [76, "Task manager", "76653ada1e76186e25aad4b602efb1a2d676a458", 450],
    [77, "Crypto wallet", "2b97568492c0031451a3cf89c1734480bdce4565", 450],
  ],
  [
    [72, "Streaks", "f5e89e71aaa56641055d69084ae132d3208ec8be", 450],
    [73, "Inbox app", "stage-inbox", 466],
    [75, "Wallet app", "cb8c08e770b206aef416e621855ca9485040359a", 450],
  ],
]);

const landingPages = group("Landing pages", "Landing page", [
  [
    [78, "Sentinel AI · Landing", "241651aefa0cca71626c3359d0a145bc029bf294", 466, 1],
    [80, "Bounty", "94173141434681192ad237e3b713f6729b37b4a6", 672],
    [82, "FORMA", "cb2b7917c45815f8ee8215d46bf75c8cace3bc7a", 464, 1],
    [84, "NEXORA", "ee7404a71647fb85ead7f5af532312d0332c11c7", 464, 1],
  ],
  [
    [79, "Sentinel AI · Platform & pricing", "9ad1ead393ab97b1c472b6305e805b2b0a0c8818", 618, 1],
    [81, "Cluely", "42c9ea50673d98ae757638ebd2120ecf3f145e03", 536],
    [83, "Quality Seeds", "d4495b5f9da0bfe6d25396aeceac6ed7e023acbf", 462],
    [85, "Canvas AI", "f472f0e22f606abc479d58e1baec69c13560cd03", 464, 1],
  ],
]);

const bento = group("Bento & UI cards", "Bento", [
  [
    [86, "Sentinel AI · Bento grid", "11ccf011219f9a45c8153757bed51cd010c219de", 736, 1],
    [88, "Sentinel AI · Instrument bento", "0dda3ab478a648bc7d298c0c643be97a56512e26", 766, 1],
    [90, "Instrument cards", "37653ce3eb9a8448495fab210e9c99a7d53ab2a2", 780, 1],
  ],
  [
    [87, "Sentinel AI · Cinematic bento", "99c2008141a5e2bd39aa3d0197f8f25d9aa75b97", 814, 1],
    [89, "Minimal bento", "87ab4dddf1e58d3cf99d69ec4a89719500950aca", 704, 1],
  ],
]);

type LiveRow = [index: number, title: string, url: string, image: string, live: boolean, column: 0 | 1];

const liveRows: LiveRow[] = [
  [91, "Amply", "https://www.joinamply.com/", "603f6bfd834a303b7ec951858ab72fa3719fa591", false, 0],
  [92, "Datalyr", "https://datalyr.com/", "13d433e18f8f30c8efd7fc417f6f4f7031c0e808", true, 0],
  [93, "Everflow", "https://www.everflow.io/", "63fb410fc9f02dcb9fb073ae2a96d58000a5ee58", true, 0],
  [94, "QuantVPS", "https://www.quantvps.com/", "e95fee6f6653cbe899bb42f21defc33da47eedbb", true, 0],
  [95, "Roots by GA", "http://rootsbyga.com/", "9cec70fb780848f40be12516739474c8b3aba088", true, 0],
  [96, "Berachain", "https://www.berachain.com/", "5052fcc5a1a26f2f8718bf73a782e8c705581735", false, 1],
  [97, "Drewl", "https://drewl.com/", "29ad6fa8004459fd90c8459c6b26de44cc4bfb90", true, 1],
  [98, "Exalt Studio", "https://exalt-studio.com/", "e4706fdbb36255cc0d237d36c00c2a7bac57aaa8", true, 1],
  [99, "Moviegen", "https://moviegen.com/", "84e9a024275176b53b54cda7ad1ec1b0ef3ef42d", true, 1],
  [100, "Retainable", "https://www.retainable.com/", "9144899ee748e3dd92260746b7fd7ab130f4a0ef", true, 1],
];

const liveWebsites: Project[] = liveRows.map(([index, title, url, key, live, column]) => ({
  index,
  title,
  tag: new URL(url).hostname.replace(/^www\./, ""),
  category: "Live websites",
  image: img(key),
  height: 466,
  column,
  url,
  live,
}));

export const projects: Project[] = [
  ...dashboards,
  ...webApps,
  ...mobileApps,
  ...landingPages,
  ...bento,
  ...liveWebsites,
];

export const categories: { name: Category; meta?: string }[] = [
  { name: "Dashboards" },
  { name: "Web apps" },
  { name: "Mobile apps" },
  { name: "Landing pages" },
  { name: "Bento & UI cards", meta: "Bento grids and instrument cards for AI and data products" },
  { name: "Live websites", meta: "Shipped for clients — click a card to open the live site" },
];

export const byCategory = (name: Category) =>
  projects.filter((p) => p.category === name);

export const newCount = (name: Category) =>
  byCategory(name).filter((p) => p.isNew).length;

type MarqueeRow = [title: string, tag: string, image: string];

const marqueeRows: MarqueeRow[] = [
  ["Nezuko", "Dashboard", "bd2355a49b1ca34f9662d09a2bd9c897de18e322"],
  ["Modelgate — Logs", "Dashboard", "c49df818b989fbbed34e7dbecbb99a92bf93237c"],
  ["BetFlow — Trade history", "Dashboard", "dc52b77d0b5f58c2609318b0d3b3109760579443"],
  ["PropelMatch", "Dashboard", "bc54b1f48870089d25a5259785d0f04eb400731f"],
  ["Modelgate — Models", "Dashboard", "7c728fd296dde9de12ef3cab3bed46140f131fc6"],
  ["BetFlow — Markets", "Dashboard", "8fc683b464da57bffba4759690e4e7c851ec6e04"],
  ["PropelMatch", "Dashboard", "2d33376786973fca8fc87025f32842b6e64bb004"],
  ["Aether AI — Charging ledger", "Dashboard", "d3623714858b045c3408f9548ee83fc638eb6805"],
  ["Kargo", "Dashboard", "713365b1ede16aac4b3ac9d1e59552d63e8091fe"],
  ["Modelgate", "Dashboard", "7d0c2e54276817e959aa3f516cfbe6e473239723"],
  ["Nezuko", "Dashboard", "553335a4c77769a647d1e7c292a67c7688e35d10"],
  ["Analytics suite", "Dashboard", "25e70dd1fbc21b2d9502cd13c8c751f904cbc61f"],
  ["Crypto portfolio", "Dashboard", "d26a9406adbc59d560bc7722c4b92d2b4ccf0f27"],
  ["Afine", "Dashboard", "69d6da655ddd89147e045e6e34fa94f956fd1d63"],
  ["Project overview", "Dashboard", "0c265547f146de90271f8c8442f4bcf40d69d7d6"],
  ["Revenue dashboard", "Dashboard", "237730550228b8ceb247afe359565fa357136a4e"],
  ["Cutmage — Asset library", "Dashboard", "a234608b7021bf2f86d164e014d9452ff70da292"],
  ["Developer console", "Dashboard", "35edcc84fff63f35178335192d4cdb13df7d5be0"],
  ["Cutmage — Activity", "Dashboard", "5929149945e1567fa68c9ce8a816f1a6b7d93968"],
  ["Cutmage — Content calendar", "Dashboard", "7d5e4129ba044083f4962a31041289cc8bdddb14"],
  ["Cutmage — Templates", "Dashboard", "7f8533446af6959a18c5c6bb7911891250c78e0f"],
  ["Cutmage — Color grading", "Dashboard", "1391c77572ace450e81071319a3a5fafa9bdd114"],
  ["Cutmage — Exports", "Dashboard", "ea8a3e7583695b8ed0bcd8c8d048b526d5816e01"],
  ["Cutmage — Brand kit", "Dashboard", "636409ca8a600635b09589a2971f0f50bfd10017"],
  ["Cutmage — Review & comments", "Dashboard", "57771f84fda079d7e09d447028c4eefda6cae76c"],
  ["Sales dashboard", "Dashboard", "a6e3888068799ac66a2cd5e9cf4e2970414b819a"],
  ["Cutmage — Storage & usage", "Dashboard", "45a81b7f63c395082e6b590246fccdacd0914e48"],
  ["Cutmage — Team & permissions", "Dashboard", "448790a70111994e3340aab9d1475b9e258843a8"],
  ["Cutmage — Editor", "Dashboard", "faa86174cd7600bd4cbc8f16b71760fe9c5eda2b"],
  ["Cutmage — Insights", "Dashboard", "7a179a960f9b4f3aba03b1c833e1b5434c2d91be"],
  ["Cutmage — Billing & plan", "Dashboard", "70050d16315a226609bbd919f90e52789c7b415b"],
  ["Cutmage — Home", "Dashboard", "71bda6553ccafa8d7f8e4d185032bb4e003594a6"],
  ["Cutmage — Media library", "Dashboard", "f1642774364ca72f10f69270c7b660869cb1d373"],
  ["Slack AI Agents", "Web app", "00598efbb730575ed0a7c3d3afb6f38131a50589"],
  ["E-course", "Web app", "87e72bbb2ef491b5c9cb0f504b91bd16b39e548c"],
  ["Job board", "Web app", "0fe14429b887dadc68389e709b1709ac65b80a42"],
  ["Team task tracker", "Web app", "d42e32eac44335c267fff79cf54f92199faef6e0"],
  ["Team task tracker", "Web app", "50b709e9705318c85b6798b5501e9fd8b22227bf"],
  ["AI photo studio", "Web app", "a7f731e040f804a588980d27c21f5e9b75c323fd"],
  ["Team task tracker", "Web app", "66bbf8e5b6a47de21341d474835590953ea174ba"],
  ["Image gallery", "Web app", "2e9184ffeef237d9223828b19da9a1610b760836"],
  ["Team chat", "Web app", "bf73535ba21f71fedcd5f41a412e0656c9245784"],
  ["File storage", "Web app", "3979631865e9cff0bd868dfea4a22d0f8bcbc735"],
  ["Moolah", "Mobile app", "b4e04988c5165d6b80b15e00d7ca6e93cf9ac17b"],
  ["Inbox app", "Mobile app", "stage-inbox"],
  ["Stride", "Mobile app", "stage-stride"],
  ["Wallet app", "Mobile app", "cb8c08e770b206aef416e621855ca9485040359a"],
  ["Task manager", "Mobile app", "76653ada1e76186e25aad4b602efb1a2d676a458"],
  ["Crypto wallet", "Mobile app", "2b97568492c0031451a3cf89c1734480bdce4565"],
  ["Sentinel AI — Landing", "Landing page", "241651aefa0cca71626c3359d0a145bc029bf294"],
  ["Sentinel AI — Platform & pricing", "Landing page", "9ad1ead393ab97b1c472b6305e805b2b0a0c8818"],
  ["Cluely", "Landing page", "42c9ea50673d98ae757638ebd2120ecf3f145e03"],
  ["FORMA", "Landing page", "cb2b7917c45815f8ee8215d46bf75c8cace3bc7a"],
  ["NEXORA", "Landing page", "ee7404a71647fb85ead7f5af532312d0332c11c7"],
  ["Canvas AI", "Landing page", "f472f0e22f606abc479d58e1baec69c13560cd03"],
];

export const selectedWork = marqueeRows.map(([title, tag, key], i) => ({
  index: i + 1,
  title,
  tag,
  image: img(key),
}));
