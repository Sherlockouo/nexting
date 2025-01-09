// 定义基础错误类
class CustomError extends Error {
  public isRetriable: boolean;
  public timestamp: string;

  constructor(message: string, isRetriable: boolean) {
    super(message);
    this.isRetriable = isRetriable;
    this.timestamp = new Date().toISOString();

    // 设置原型，确保 instanceof 检测正常
    Object.setPrototypeOf(this, new.target.prototype);
  }

  // 格式化错误为字符串
  toString() {
    return `[${this.timestamp}] ${this.isRetriable ? "RetriableError" : "FatalError"}: ${this.message}`;
  }
}

// 定义 FatalError 类
export class FatalError extends CustomError {
  constructor(message: string = "A fatal error occurred") {
    super(message, false); // FatalError 不可重试
  }
}

// 定义 RetriableError 类
export class RetriableError extends CustomError {
  constructor(message: string = "A retriable error occurred") {
    super(message, true); // RetriableError 可重试
  }
}
