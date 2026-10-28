// Each player gets one of these muted colours behind their initial, picked
// by name, so they look the same in chat and in the bets.
export const AVATARS = ["#56649e", "#4c8068", "#a06a4a", "#7a5d96", "#4a7a8c", "#937c46", "#9a5060"];

export const avatarOf = (name: string) => AVATARS[[...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % AVATARS.length];
