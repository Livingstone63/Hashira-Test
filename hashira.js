const absoluteValue = (number) => (number < 0n ? -number : number);

const greatestCommonDivisor = (firstNumber, secondNumber) => {
    firstNumber = absoluteValue(firstNumber);
    secondNumber = absoluteValue(secondNumber);
    while (secondNumber !== 0n) {
        let temporary = secondNumber;
        secondNumber = firstNumber % secondNumber;
        firstNumber = temporary;
    }
    return firstNumber;
};

class RationalNumber {
    constructor(numerator, denominator = 1n) {
        this.numerator = numerator;
        this.denominator = denominator;
        this.normalize();
    }

    normalize() {
        if (this.denominator === 0n) {
            throw new Error('Division by zero error');
        }
        if (this.denominator < 0n) {
            this.numerator = -this.numerator;
            this.denominator = -this.denominator;
        }
        const divisor = greatestCommonDivisor(absoluteValue(this.numerator), this.denominator);
        this.numerator /= divisor;
        this.denominator /= divisor;
    }

    static add(firstRational, secondRational) {
        const divisor = greatestCommonDivisor(firstRational.denominator, secondRational.denominator);
        const commonDenominator = (firstRational.denominator / divisor) * secondRational.denominator;
        const combinedNumerator = firstRational.numerator * (secondRational.denominator / divisor) + secondRational.numerator * (firstRational.denominator / divisor);
        return new RationalNumber(combinedNumerator, commonDenominator);
    }

    static multiply(firstRational, secondRational) {
        const productNumerator = firstRational.numerator * secondRational.numerator;
        const productDenominator = firstRational.denominator * secondRational.denominator;
        return new RationalNumber(productNumerator, productDenominator);
    }
}

const convertStringToBigInt = (inputString, radix) => {
    let result = 0n;
    inputString = inputString.toLowerCase();
    for (let character of inputString) {
        let digitValue;
        if (character >= '0' && character <= '9') {
            digitValue = parseInt(character);
        } else {
            digitValue = 10 + (character.charCodeAt(0) - 'a'.charCodeAt(0));
        }
        if (digitValue >= radix || digitValue < 0) {
            throw new Error('Invalid character in input string');
        }
        result = result * BigInt(radix) + BigInt(digitValue);
    }
    return result;
};

const computeConstantTerm = (testData) => {
    const parameters = testData.keys;
    const totalRoots = parameters.n;
    const requiredRoots = parameters.k;
    
    let coordinatePoints = [];
    for (let key in testData) {
        if (key === 'keys') continue;
        const xCoordinate = BigInt(key);
        const pointData = testData[key];
        const baseRadix = parseInt(pointData.base);
        const yValueString = pointData.value;
        const yCoordinate = convertStringToBigInt(yValueString, baseRadix);
        coordinatePoints.push({ x: xCoordinate, y: yCoordinate });
    }
    
    coordinatePoints.sort((firstPoint, secondPoint) => 
        (firstPoint.x < secondPoint.x ? -1 : firstPoint.x > secondPoint.x ? 1 : 0));
    
    const selectedPoints = coordinatePoints.slice(0, requiredRoots);
    const evaluationPoint = 0n;
    
    let lagrangeSum = new RationalNumber(0n, 1n);
    
    for (let currentIndex = 0; currentIndex < requiredRoots; currentIndex++) {
        const currentX = selectedPoints[currentIndex].x;
        const currentY = selectedPoints[currentIndex].y;
        
        let numeratorProduct = 1n;
        let denominatorProduct = 1n;
        
        for (let otherIndex = 0; otherIndex < requiredRoots; otherIndex++) {
            if (currentIndex === otherIndex) continue;
            const otherX = selectedPoints[otherIndex].x;
            numeratorProduct *= evaluationPoint - otherX;
            denominatorProduct *= currentX - otherX;
        }
        
        const lagrangeBasis = new RationalNumber(numeratorProduct, denominatorProduct);
        const weightedTerm = RationalNumber.multiply(new RationalNumber(currentY, 1n), lagrangeBasis);
        lagrangeSum = RationalNumber.add(lagrangeSum, weightedTerm);
    }
    
    if (lagrangeSum.denominator !== 1n) {
        if (lagrangeSum.numerator % lagrangeSum.denominator !== 0n) {
            throw new Error('Result is not an integer value');
        }
        return lagrangeSum.numerator / lagrangeSum.denominator;
    }
    
    return lagrangeSum.numerator;
};

// Test Case 1
const testCase1 = {
    "keys": {
        "n": 4,
        "k": 3
    },
    "1": {
        "base": "10",
        "value": "4"
    },
    "2": {
        "base": "2",
        "value": "111"
    },
    "3": {
        "base": "10",
        "value": "12"
    },
    "6": {
        "base": "4",
        "value": "213"
    }
};

// Test Case 2
const testCase2 = {
    "keys": {
        "n": 10,
        "k": 7
    },
    "1": {
        "base": "7",
        "value": "420020006424065463"
    },
    "2": {
        "base": "7",
        "value": "10511630252064643035"
    },
    "3": {
        "base": "2",
        "value": "101010101001100101011100000001000111010010111101100100010"
    },
    "4": {
        "base": "8",
        "value": "31261003022226126015"
    },
    "5": {
        "base": "7",
        "value": "2564201006101516132035"
    },
    "6": {
        "base": "15",
        "value": "a3c97ed550c69484"
    },
    "7": {
        "base": "13",
        "value": "134b08c8739552a734"
    },
    "8": {
        "base": "10",
        "value": "23600283241050447333"
    },
    "9": {
        "base": "9",
        "value": "375870320616068547135"
    },
    "10": {
        "base": "6",
        "value": "30140555423010311322515333"
    }
};

// Compute and display results for both test cases
console.log("Test Case 1 Constant Term:", computeConstantTerm(testCase1).toString());
console.log("Test Case 2 Constant Term:", computeConstantTerm(testCase2).toString());
