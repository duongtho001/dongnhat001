// services/apiKeyManager.ts

class ApiKeyManager {
  private keys: string[] = [];
  public currentIndex: number = 0;
  public totalKeys: number = 0;

  loadKeys(keysString: string) {
    this.keys = keysString.split('\n').map(k => k.trim()).filter(k => k !== '');
    this.currentIndex = 0;
    this.totalKeys = this.keys.length;
    console.log(`${this.totalKeys} API key(s) loaded into the manager.`);
  }

  getCurrentKey(): string {
    if (this.totalKeys === 0) {
      // This specific error message is caught by the service functions
      // to provide a user-friendly error.
      throw new Error("NO_API_KEY_CONFIGURED");
    }
    // Fallback to environment variable if no user keys are provided but the app needs to run
    if (this.keys[this.currentIndex]) {
        return this.keys[this.currentIndex];
    }
    return process.env.API_KEY || '';
  }

  /**
   * Rotates to the next available key.
   * @returns {boolean} - True if rotation was successful, false if there are no other keys to rotate to.
   */
  rotateToNextKey(): boolean {
    if (this.totalKeys <= 1) {
      return false; // Cannot rotate if there's only one or zero keys.
    }
    const previousIndex = this.currentIndex;
    this.currentIndex = (this.currentIndex + 1) % this.totalKeys;
    console.warn(`Quota issue detected on key index ${previousIndex}. Rotating to next API key (index: ${this.currentIndex}).`);
    return true;
  }
}

// Export a singleton instance
export const apiKeyManager = new ApiKeyManager();
