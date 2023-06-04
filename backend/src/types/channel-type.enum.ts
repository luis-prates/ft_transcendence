export enum ChannelType {
    PUBLIC = "PUBLIC", // anyone can join with name
    PRIVATE = "PRIVATE", // join only with invite
    PROTECTED = "PROTECTED", // need password or invite
    DM = "DM", // direct between 2 users
}