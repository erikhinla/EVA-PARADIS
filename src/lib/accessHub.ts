export type AccessLevel = "Owner Only" | "Delegate" | "Read Only";

export type AccessHubRow = {
  platform: string;
  url: string;
  twoFaMethod: string;
  twoFaDestination: string;
  access: AccessLevel;
  owner: string;
  notes: string;
};

export const ACCESS_HUB_STORAGE_KEY = "access_hub_rows_v1";

export const ACCESS_HUB_DEFAULT_ROWS: AccessHubRow[] = [
  {
    platform: "X (Twitter)",
    url: "https://x.com/login",
    twoFaMethod: "Authenticator",
    twoFaDestination: "Owner device",
    access: "Owner Only",
    owner: "Eva",
    notes: "Pinned link hub",
  },
  {
    platform: "Instagram",
    url: "https://www.instagram.com/accounts/login/",
    twoFaMethod: "Authenticator",
    twoFaDestination: "Owner device",
    access: "Owner Only",
    owner: "Eva",
    notes: "Bio + Stories",
  },
  {
    platform: "TikTok",
    url: "https://www.tiktok.com/login",
    twoFaMethod: "Authenticator",
    twoFaDestination: "Owner device",
    access: "Owner Only",
    owner: "Eva",
    notes: "Discovery traffic",
  },
  {
    platform: "Reddit",
    url: "https://www.reddit.com/login/",
    twoFaMethod: "Authenticator",
    twoFaDestination: "Owner device",
    access: "Delegate",
    owner: "Eva",
    notes: "Post-only",
  },
  {
    platform: "TrafficJunky",
    url: "https://www.trafficjunky.com/login",
    twoFaMethod: "Authenticator",
    twoFaDestination: "Owner device",
    access: "Owner Only",
    owner: "Eva",
    notes: "Paid traffic",
  },
  {
    platform: "Pornhub",
    url: "https://www.pornhub.com/login",
    twoFaMethod: "Authenticator",
    twoFaDestination: "Owner device",
    access: "Owner Only",
    owner: "Eva",
    notes: "Ads / profile",
  },
  {
    platform: "xHamster",
    url: "https://xhamster.com/login",
    twoFaMethod: "Authenticator",
    twoFaDestination: "Owner device",
    access: "Owner Only",
    owner: "Eva",
    notes: "Traffic source",
  },
  {
    platform: "OnlyFans",
    url: "https://onlyfans.com",
    twoFaMethod: "Authenticator",
    twoFaDestination: "Owner device",
    access: "Owner Only",
    owner: "Eva",
    notes: "Primary revenue",
  },
  {
    platform: "Bridge Page Hosting",
    url: "(prod URL)",
    twoFaMethod: "Authenticator",
    twoFaDestination: "Owner device",
    access: "Owner Only",
    owner: "Erik",
    notes: "Funnel control + routing",
  },
  {
    platform: "Domain Registrar",
    url: "(Namecheap / GoDaddy)",
    twoFaMethod: "Authenticator",
    twoFaDestination: "Owner device",
    access: "Owner Only",
    owner: "Erik",
    notes: "DNS control",
  },
  {
    platform: "Email Platform",
    url: "(Klaviyo / ConvertKit / SendGrid)",
    twoFaMethod: "Authenticator",
    twoFaDestination: "Owner device",
    access: "Delegate",
    owner: "Erik",
    notes: "Sequences + backups",
  },
  {
    platform: "SMS Platform",
    url: "(Twilio / SimpleTexting)",
    twoFaMethod: "Authenticator",
    twoFaDestination: "Owner device",
    access: "Delegate",
    owner: "Erik",
    notes: "SMS flows",
  },
  {
    platform: "Analytics",
    url: "(GA / Pixels)",
    twoFaMethod: "Authenticator",
    twoFaDestination: "Owner device",
    access: "Read Only",
    owner: "Erik",
    notes: "Reporting",
  },
];
