export interface ITokenProvider {
  setToken(token: string): void;
  getToken(): string | null;
  clearToken(): void;
  hasToken(): boolean;
}