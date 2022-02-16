/* Function that checks if the provided solution is the correct one */
type SolverFunc = (data: any) => any;

interface ICodingContractTypeMetadata {
  name: string;
  difficulty: number;
  answer: SolverFunc;
}

/* Represents different types of problems that a Coding Contract can have */
export class CodingContractType {
  /**
   * Number that generally represents the problem's difficulty. Bigger numbers = harder
   */
  difficulty: number;

  /**
   * Name or Type of the the problem
   */
  name: string;

  /**
   * Stores a function that solves the problem
   */
  answer: SolverFunc;

  constructor(name: string, answer: SolverFunc, difficulty: number) {
    this.name = name;
    this.answer = answer;
    this.difficulty = difficulty;
  }
}

/* Helper functions for Coding Contracts */
function removeBracketsFromArrayString(str: string): string {
  let strCpy: string = str;
  if (strCpy.startsWith('[')) {
    strCpy = strCpy.slice(1);
  }
  if (strCpy.endsWith(']')) {
    strCpy = strCpy.slice(0, -1);
  }

  return strCpy;
}

function convert2DArrayToString(arr: any[][]): string {
  const components: string[] = [];
  arr.forEach((e: any) => {
    let s: string = e.toString();
    s = ['[', s, ']'].join('');
    components.push(s);
  });

  return components.join(',').replace(/\s/g, '');
}

function removeQuotesFromString(str: string): string {
  let strCpy: string = str;
  if (strCpy.startsWith('"') || strCpy.startsWith("'")) {
    strCpy = strCpy.slice(1);
  }
  if (strCpy.endsWith('"') || strCpy.endsWith("'")) {
    strCpy = strCpy.slice(0, -1);
  }

  return strCpy;
}

export const codingContractTypes: ICodingContractTypeMetadata[] = [
  {
    difficulty: 1,
    name: 'Find Largest Prime Factor',
    answer: (data: number): number => {
      let fac = 2;
      let n: number = data;
      while (n > (fac - 1) * (fac - 1)) {
        while (n % fac === 0) {
          n = Math.round(n / fac);
        }
        ++fac;
      }

      return n === 1 ? fac - 1 : n;
    },
  },
  {
    difficulty: 1,
    name: 'Subarray with Maximum Sum',
    answer: (data: number[]): number => {
      const nums: number[] = data.slice();
      for (let i = 1; i < nums.length; i++) {
        nums[i] = Math.max(nums[i], nums[i] + nums[i - 1]);
      }

      return Math.max(...nums);
    },
  },
  {
    difficulty: 1.5,
    name: 'Total Ways to Sum',
    answer: (data: number): number => {
      const ways: number[] = [1];
      ways.length = data + 1;
      ways.fill(0, 1);
      for (let i = 1; i < data; ++i) {
        for (let j: number = i; j <= data; ++j) {
          ways[j] += ways[j - i];
        }
      }

      return ways[data];
    },
  },
  {
    difficulty: 2,
    name: 'Spiralize Matrix',
    answer: (data: number[][]): number[] => {
      const spiral: number[] = [];
      const m: number = data.length;
      const n: number = data[0].length;
      let u = 0;
      let d: number = m - 1;
      let l = 0;
      let r: number = n - 1;
      let k = 0;
      while (true) {
        // Up
        for (let col: number = l; col <= r; col++) {
          spiral[k] = data[u][col];
          ++k;
        }
        if (++u > d) {
          break;
        }

        // Right
        for (let row: number = u; row <= d; row++) {
          spiral[k] = data[row][r];
          ++k;
        }
        if (--r < l) {
          break;
        }

        // Down
        for (let col: number = r; col >= l; col--) {
          spiral[k] = data[d][col];
          ++k;
        }
        if (--d < u) {
          break;
        }

        // Left
        for (let row: number = d; row >= u; row--) {
          spiral[k] = data[row][l];
          ++k;
        }
        if (++l > r) {
          break;
        }
      }

      return spiral;
    },
  },
  {
    difficulty: 2.5,
    name: 'Array Jumping Game',
    answer: (data: number[]): number => {
      const n: number = data.length;
      let i = 0;
      for (let reach = 0; i < n && i <= reach; ++i) {
        reach = Math.max(i + data[i], reach);
      }
      return i === n ? 1 : 0;
    },
  },
  {
    difficulty: 3,
    name: 'Merge Overlapping Intervals',
    answer: (data: number[][]): string => {
      const intervals: number[][] = data.slice();
      intervals.sort((a: number[], b: number[]) => {
        return a[0] - b[0];
      });

      const result: number[][] = [];
      let start: number = intervals[0][0];
      let end: number = intervals[0][1];
      for (const interval of intervals) {
        if (interval[0] <= end) {
          end = Math.max(end, interval[1]);
        } else {
          result.push([start, end]);
          start = interval[0];
          end = interval[1];
        }
      }
      result.push([start, end]);

      const sanitizedResult: string = convert2DArrayToString(result);

      return sanitizedResult;
    },
  },
  {
    difficulty: 3,
    name: 'Generate IP Addresses',
    answer: (data: string): string[] => {
      const ret: string[] = [];
      for (let a = 1; a <= 3; ++a) {
        for (let b = 1; b <= 3; ++b) {
          for (let c = 1; c <= 3; ++c) {
            for (let d = 1; d <= 3; ++d) {
              if (a + b + c + d === data.length) {
                const A: number = parseInt(data.substring(0, a), 10);
                const B: number = parseInt(data.substring(a, a + b), 10);
                const C: number = parseInt(data.substring(a + b, a + b + c), 10);
                const D: number = parseInt(data.substring(a + b + c, a + b + c + d), 10);
                if (A <= 255 && B <= 255 && C <= 255 && D <= 255) {
                  const ip: string = [A.toString(), '.', B.toString(), '.', C.toString(), '.', D.toString()].join('');
                  if (ip.length === data.length + 3) {
                    ret.push(ip);
                  }
                }
              }
            }
          }
        }
      }
      return ret;
    },
  },
  {
    difficulty: 1,
    name: 'Algorithmic Stock Trader I',
    answer: (data: number[]): string => {
      let maxCur = 0;
      let maxSoFar = 0;
      for (let i = 1; i < data.length; ++i) {
        maxCur = Math.max(0, (maxCur += data[i] - data[i - 1]));
        maxSoFar = Math.max(maxCur, maxSoFar);
      }

      return maxSoFar.toString();
    },
  },
  {
    difficulty: 2,
    name: 'Algorithmic Stock Trader II',
    answer: (data: number[]): string => {
      let profit = 0;
      for (let p = 1; p < data.length; ++p) {
        profit += Math.max(data[p] - data[p - 1], 0);
      }

      return profit.toString();
    },
  },
  {
    difficulty: 5,
    name: 'Algorithmic Stock Trader III',
    answer: (data: number[]): string => {
      let hold1: number = Number.MIN_SAFE_INTEGER;
      let hold2: number = Number.MIN_SAFE_INTEGER;
      let release1 = 0;
      let release2 = 0;
      for (const price of data) {
        release2 = Math.max(release2, hold2 + price);
        hold2 = Math.max(hold2, release1 - price);
        release1 = Math.max(release1, hold1 + price);
        hold1 = Math.max(hold1, price * -1);
      }

      return release2.toString();
    },
  },
  {
    difficulty: 8,
    name: 'Algorithmic Stock Trader IV',
    answer: (data: any[]): number => {
      const k: number = data[0];
      const prices: number[] = data[1];
      const len = prices.length;

      if (k > len / 2) {
        let res = 0;
        for (let i = 1; i < len; ++i) {
          res += Math.max(prices[i] - prices[i - 1], 0);
        }

        return res;
      }

      const hold: number[] = [];
      const rele: number[] = [];
      hold.length = k + 1;
      rele.length = k + 1;
      for (let i = 0; i <= k; ++i) {
        hold[i] = Number.MIN_SAFE_INTEGER;
        rele[i] = 0;
      }

      let cur: number;
      for (let i = 0; i < len; ++i) {
        cur = prices[i];
        for (let j = k; j > 0; --j) {
          rele[j] = Math.max(rele[j], hold[j] + cur);
          hold[j] = Math.max(hold[j], rele[j - 1] - cur);
        }
      }

      return rele[k];
    },
  },
  {
    difficulty: 5,
    name: 'Minimum Path Sum in a Triangle',
    answer: (data: number[][]): number => {
      const n: number = data.length;
      const dp: number[] = data[n - 1].slice();
      for (let i = n - 2; i > -1; --i) {
        for (let j = 0; j < data[i].length; ++j) {
          dp[j] = Math.min(dp[j], dp[j + 1]) + data[i][j];
        }
      }

      return dp[0];
    },
  },
  {
    difficulty: 3,
    name: 'Unique Paths in a Grid I',
    answer: (data: number[]): number => {
      const n: number = data[0]; // Number of rows
      const m: number = data[1]; // Number of columns
      const currentRow: number[] = [];
      currentRow.length = n;

      for (let i = 0; i < n; i++) {
        currentRow[i] = 1;
      }
      for (let row = 1; row < m; row++) {
        for (let i = 1; i < n; i++) {
          currentRow[i] += currentRow[i - 1];
        }
      }

      return currentRow[n - 1];
    },
  },
  {
    difficulty: 5,
    name: 'Unique Paths in a Grid II',
    answer: (data: number[][]): number => {
      const obstacleGrid: number[][] = [];
      obstacleGrid.length = data.length;
      for (let i = 0; i < obstacleGrid.length; ++i) {
        obstacleGrid[i] = data[i].slice();
      }

      for (let i = 0; i < obstacleGrid.length; i++) {
        for (let j = 0; j < obstacleGrid[0].length; j++) {
          if (obstacleGrid[i][j] == 1) {
            obstacleGrid[i][j] = 0;
          } else if (i == 0 && j == 0) {
            obstacleGrid[0][0] = 1;
          } else {
            obstacleGrid[i][j] = (i > 0 ? obstacleGrid[i - 1][j] : 0) + (j > 0 ? obstacleGrid[i][j - 1] : 0);
          }
        }
      }

      return obstacleGrid[obstacleGrid.length - 1][obstacleGrid[0].length - 1];
    },
  },
  {
    difficulty: 10,
    name: 'Sanitize Parentheses in Expression',
    answer: (data: string): string[] => {
      let left = 0;
      let right = 0;
      const res: string[] = [];

      for (let i = 0; i < data.length; ++i) {
        if (data[i] === '(') {
          ++left;
        } else if (data[i] === ')') {
          left > 0 ? --left : ++right;
        }
      }

      function dfs(
        pair: number,
        index: number,
        left: number,
        right: number,
        s: string,
        solution: string,
        res: string[]
      ): void {
        if (s.length === index) {
          if (left === 0 && right === 0 && pair === 0) {
            for (let i = 0; i < res.length; i++) {
              if (res[i] === solution) {
                return;
              }
            }
            res.push(solution);
          }
          return;
        }

        if (s[index] === '(') {
          if (left > 0) {
            dfs(pair, index + 1, left - 1, right, s, solution, res);
          }
          dfs(pair + 1, index + 1, left, right, s, solution + s[index], res);
        } else if (s[index] === ')') {
          if (right > 0) dfs(pair, index + 1, left, right - 1, s, solution, res);
          if (pair > 0) dfs(pair - 1, index + 1, left, right, s, solution + s[index], res);
        } else {
          dfs(pair, index + 1, left, right, s, solution + s[index], res);
        }
      }

      dfs(0, 0, left, right, data, '', res);

      return res;
    },
  },
  {
    difficulty: 10,
    name: 'Find All Valid Math Expressions',
    answer: (data: any[]): string[] => {
      const num: string = data[0];
      const target: number = data[1];

      function helper(
        res: string[],
        path: string,
        num: string,
        target: number,
        pos: number,
        evaluated: number,
        multed: number
      ): void {
        if (pos === num.length) {
          if (target === evaluated) {
            res.push(path);
          }
          return;
        }

        for (let i = pos; i < num.length; ++i) {
          if (i != pos && num[pos] == '0') {
            break;
          }
          const cur = parseInt(num.substring(pos, i + 1));

          if (pos === 0) {
            helper(res, path + cur, num, target, i + 1, cur, cur);
          } else {
            helper(res, path + '+' + cur, num, target, i + 1, evaluated + cur, cur);
            helper(res, path + '-' + cur, num, target, i + 1, evaluated - cur, -cur);
            helper(res, path + '*' + cur, num, target, i + 1, evaluated - multed + multed * cur, multed * cur);
          }
        }
      }

      const result: string[] = [];
      helper(result, '', num, target, 0, 0, 0);

      return result;
    },
  },
];
