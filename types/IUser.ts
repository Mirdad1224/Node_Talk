export default interface IUser {
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  password?: string;
  passwordChangedAt: DateConstructor | number;
  passwordResetToken: string | undefined;
  passwordResetExpires: DateConstructor | undefined;
  createdAt: DateConstructor | number;
  updatedAt: DateConstructor;
  verified: boolean;
  otp: string | undefined;
  otp_expiry_time: DateConstructor;
  friends: any[];
  socket_id: string;
  status: "Online" | "Offline";
}

export interface IUserMethods {
  correctPassword(candidateOTP: string, userOTP: string): Promise<boolean>;
  correctOTP(candidateOTP: string, userOTP: string): Promise<boolean>;
  changedPasswordAfter(JWTTimeStamp: number): boolean;
  createPasswordResetToken(): string;
}
