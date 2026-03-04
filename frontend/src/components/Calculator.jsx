import { useState, useRef, useEffect } from 'react';
import { Calculator as CalcIcon, X, Minus } from 'lucide-react';

export default function Calculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState('');
  const calcRef = useRef(null);

  // Keyboard support
  useEffect(() => {
    if (!isOpen || isMinimized) return;
    const handleKey = (e) => {
      if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
      else if (e.key === '.') inputDot();
      else if (e.key === '+') performOperation('+');
      else if (e.key === '-') performOperation('-');
      else if (e.key === '*') performOperation('×');
      else if (e.key === '/') { e.preventDefault(); performOperation('÷'); }
      else if (e.key === 'Enter' || e.key === '=') performOperation('=');
      else if (e.key === 'Escape') clearAll();
      else if (e.key === 'Backspace') backspace();
      else if (e.key === '%') inputPercent();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, isMinimized, display, prevValue, operator, waitingForOperand]);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const inputPercent = () => {
    const val = parseFloat(display);
    if (val === 0) return;
    setDisplay(String(val / 100));
  };

  const backspace = () => {
    if (waitingForOperand) return;
    if (display.length === 1 || (display.length === 2 && display[0] === '-')) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const toggleSign = () => {
    const val = parseFloat(display);
    if (val !== 0) {
      setDisplay(String(-val));
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setHistory('');
  };

  const clearEntry = () => {
    setDisplay('0');
    setWaitingForOperand(false);
  };

  const calculate = (left, op, right) => {
    switch (op) {
      case '+': return left + right;
      case '-': return left - right;
      case '×': return left * right;
      case '÷': return right !== 0 ? left / right : 'Error';
      default: return right;
    }
  };

  const performOperation = (nextOp) => {
    const current = parseFloat(display);

    if (prevValue == null) {
      setPrevValue(current);
      if (nextOp !== '=') {
        setHistory(`${formatNum(current)} ${nextOp}`);
      }
    } else if (operator) {
      const result = calculate(prevValue, operator, current);
      if (result === 'Error') {
        setDisplay('Error');
        setPrevValue(null);
        setOperator(null);
        setHistory('');
        setWaitingForOperand(true);
        return;
      }
      setPrevValue(result);
      setDisplay(String(parseFloat(result.toFixed(10))));
      if (nextOp === '=') {
        setHistory(`${formatNum(prevValue)} ${operator} ${formatNum(current)} =`);
        setPrevValue(null);
        setOperator(null);
        setWaitingForOperand(true);
        return;
      } else {
        setHistory(`${formatNum(result)} ${nextOp}`);
      }
    }

    if (nextOp !== '=') {
      setOperator(nextOp);
      setWaitingForOperand(true);
    }
  };

  const formatNum = (n) => {
    if (n == null) return '';
    const s = String(parseFloat(Number(n).toFixed(10)));
    return s;
  };

  const formatDisplay = (val) => {
    if (val === 'Error') return 'Error';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    // Don't format if user is still typing decimals
    if (val.endsWith('.') || (val.includes('.') && val.endsWith('0') && !waitingForOperand)) {
      return val;
    }
    return num.toLocaleString('en-PH', { maximumFractionDigits: 10 });
  };

  const buttons = [
    ['C', 'CE', '⌫', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['±', '0', '.', '='],
  ];

  const handleButton = (btn) => {
    switch (btn) {
      case 'C': clearAll(); break;
      case 'CE': clearEntry(); break;
      case '⌫': backspace(); break;
      case '±': toggleSign(); break;
      case '.': inputDot(); break;
      case '+': case '-': case '×': case '÷': case '=':
        performOperation(btn); break;
      default: inputDigit(btn); break;
    }
  };

  const getButtonClass = (btn) => {
    if (btn === '=') return 'calc-btn calc-btn-equals';
    if (['+', '-', '×', '÷'].includes(btn)) return 'calc-btn calc-btn-op';
    if (['C', 'CE', '⌫', '±'].includes(btn)) return 'calc-btn calc-btn-func';
    return 'calc-btn';
  };

  return (
    <>
      {/* Floating Action Bubble */}
      <button
        className="calc-fab"
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        title="Calculator"
      >
        <CalcIcon size={24} />
      </button>

      {/* Calculator Window */}
      {isOpen && !isMinimized && (
        <div className="calc-window" ref={calcRef}>
          <div className="calc-titlebar">
            <span className="calc-title">
              <CalcIcon size={14} /> Calculator
            </span>
            <div className="calc-titlebar-btns">
              <button
                className="calc-titlebar-btn"
                onClick={() => setIsMinimized(true)}
                title="Minimize"
              >
                <Minus size={14} />
              </button>
              <button
                className="calc-titlebar-btn calc-titlebar-close"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="calc-body">
            <div className="calc-history">{history || '\u00A0'}</div>
            <div className="calc-display">{formatDisplay(display)}</div>
            <div className="calc-buttons">
              {buttons.map((row, ri) =>
                row.map((btn) => (
                  <button
                    key={`${ri}-${btn}`}
                    className={getButtonClass(btn)}
                    onClick={() => handleButton(btn)}
                  >
                    {btn}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
