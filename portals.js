// Portals shown on the home page, in display order within each group.
// `slug` is the folder name (<slug>/reports/). `from`/`to` drive the card gradient, `ink` the text
// colour on it. `group` decides which section of the home page the card sits in.
module.exports = [
  // --- Drop-ship: we hold the stock and ship each order ourselves -------------------------------
  { slug: 'wayfair',        name: 'Wayfair',        group: 'dropship',    channel: 'Partner Home · Drop-ship & CastleGate', from: '#7B189F', to: '#C44FD6', ink: '#fff' },
  { slug: 'overstock',      name: 'Overstock',      group: 'dropship',    channel: 'Supplier Portal · Drop-ship',           from: '#B3121F', to: '#F0592A', ink: '#fff' },
  { slug: 'macys',          name: "Macy's",         group: 'dropship',    channel: 'Vendor Portal · Drop-ship',             from: '#141414', to: '#E21A2C', ink: '#fff' },
  { slug: 'jcpenney',       name: 'JCPenney',       group: 'dropship',    channel: 'Supplier Portal · Drop-ship',           from: '#0B2A5B', to: '#D2232A', ink: '#fff' },
  { slug: 'amazon-vendor',  name: 'Amazon Vendor',  group: 'dropship',    channel: 'Vendor Central · 1P wholesale',         from: '#FF9900', to: '#FFC266', ink: '#1A1A1A' },
  { slug: 'home-depot',     name: 'Home Depot',     group: 'dropship',    channel: 'Supplier Hub · Drop-ship',              from: '#D2600A', to: '#FF8A3D', ink: '#fff' },
  { slug: 'lowes',          name: "Lowe's",         group: 'dropship',    channel: 'LowesLink · Drop-ship',                 from: '#004990', to: '#2E7CD6', ink: '#fff' },
  { slug: 'brylane-home',   name: 'Brylane Home',   group: 'dropship',    channel: 'Vendor Portal · Drop-ship',             from: '#0F5257', to: '#2E9B9B', ink: '#fff' },
  { slug: 'touch-of-class', name: 'Touch of Class', group: 'dropship',    channel: 'Vendor Portal · Drop-ship',             from: '#7A5A14', to: '#D4AF37', ink: '#1A1A1A' },

  // --- Marketplace: we list and sell on their platform -----------------------------------------
  { slug: 'amazon-seller',  name: 'Amazon Seller',  group: 'marketplace', channel: 'Seller Central · 3P marketplace',       from: '#131A22', to: '#37475A', ink: '#FFB547' },
  { slug: 'walmart-seller', name: 'Walmart Seller', group: 'marketplace', channel: 'Seller Center · Marketplace',           from: '#0053A0', to: '#1E8FE8', ink: '#FFC220' },
  { slug: 'target-plus',    name: 'Target Plus',    group: 'marketplace', channel: 'Partner Portal · Marketplace',          from: '#CC0000', to: '#FF4D4D', ink: '#fff' },
  { slug: 'kohls',          name: "Kohl's",         group: 'marketplace', channel: 'Marketplace',                           from: '#4A0A24', to: '#8C1D47', ink: '#fff' },
];
