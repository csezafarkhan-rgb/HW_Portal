// Portals shown on the home page, in display order.
// `slug` is the folder name (<slug>/reports/). `from`/`to` drive the card gradient, `ink` the text colour on it.
module.exports = [
  { slug: 'wayfair',        name: 'Wayfair',        channel: 'Partner Home · Drop-ship & CastleGate', from: '#7B189F', to: '#C44FD6', ink: '#fff' },
  { slug: 'overstock',      name: 'Overstock',      channel: 'Supplier Portal · Drop-ship',           from: '#B3121F', to: '#F0592A', ink: '#fff' },
  { slug: 'amazon-vendor',  name: 'Amazon Vendor',  channel: 'Vendor Central · 1P wholesale',         from: '#FF9900', to: '#FFC266', ink: '#1A1A1A' },
  { slug: 'amazon-seller',  name: 'Amazon Seller',  channel: 'Seller Central · 3P marketplace',       from: '#131A22', to: '#37475A', ink: '#FFB547' },
  { slug: 'walmart-seller', name: 'Walmart Seller', channel: 'Seller Center · Marketplace',           from: '#0053A0', to: '#1E8FE8', ink: '#FFC220' },
  { slug: 'kohls',          name: "Kohl's",         channel: 'Vendor Portal · Drop-ship',             from: '#4A0A24', to: '#8C1D47', ink: '#fff' },
  { slug: 'target-plus',    name: 'Target Plus',    channel: 'Partner Portal · Marketplace',          from: '#CC0000', to: '#FF4D4D', ink: '#fff' },
  { slug: 'macys',          name: "Macy's",         channel: 'Marketplace',                           from: '#141414', to: '#E21A2C', ink: '#fff' },
  { slug: 'jcpenney',       name: 'JCPenney',       channel: 'Supplier Portal · Drop-ship',           from: '#0B2A5B', to: '#D2232A', ink: '#fff' },
];
