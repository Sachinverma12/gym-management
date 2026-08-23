/* eslint-disable @typescript-eslint/no-require-imports */
// @ts-nocheck
const jwt = require("jsonwebtoken");

describe("JWT Token Generation", () => {
  it("should generate a valid JWT token", () => {
    const payload = { userId: "test-user-id", role: "MEMBER" };
    const secret = process.env.JWT_SECRET || "gym-secret-key";
    
    const token = jwt.sign(payload, secret, { expiresIn: "7d" });
    
    expect(token).toBeDefined();
    
    // Verify the token
    const decoded = jwt.verify(token, secret);
    expect(decoded.userId).toBe("test-user-id");
    expect(decoded.role).toBe("MEMBER");
  });

  it("should fail to verify an expired token", () => {
    const payload = { userId: "test-user-id", role: "MEMBER" };
    const secret = process.env.JWT_SECRET || "gym-secret-key";
    
    const token = jwt.sign(payload, secret, { expiresIn: "-1s" });
    
    // This should throw an error because the token is expired
    expect(() => {
      jwt.verify(token, secret);
    }).toThrow();
  });

  it("should have consistent token signing", () => {
    const payload = { userId: "test-user-2", role: "ADMIN" };
    const secret = process.env.JWT_SECRET || "gym-secret-key";
    
    const token1 = jwt.sign(payload, secret, { expiresIn: "7d" });
    const token2 = jwt.sign(payload, secret, { expiresIn: "7d" });
    
    expect(token1).toBe(token2);
  });
});