import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { LaptopIcon, BaseStationIcon } from '../icons/DeviceIcons';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Radio, 
  Sparkles,
  ArrowRight,
  Flame
} from 'lucide-react';

export const CrcArqView: React.FC = () => {
  const {
    simTime,
    setSimTime,
    simPlaying,
    simSpeed,
    simulateBitError,
    setSimulateBitError,
  } = useApp();

  // Internal bit error toggle fallback if context doesn't supply it
  const [internalError, setInternalError] = useState<boolean>(false);
  const isErrorSimulated = simulateBitError !== undefined ? simulateBitError : internalError;
  const toggleError = () => {
    if (setSimulateBitError) {
      setSimulateBitError(prev => !prev);
    } else {
      setInternalError(prev => !prev);
    }
  };

  // Timeline durations:
  // Clean Send (Error OFF):
  // 0.00s - 1.80s: Laptop sends Data -> BS (1.8s)
  // 1.80s - 3.00s: BS checks CRC (PASS) -> sends ACK -> Laptop (1.2s)
  // 3.00s - 3.60s: Done hold (0.6s)
  // Total clean = 3.60s

  // Error Send (Error ON):
  // 0.00s - 0.85s: Laptop sends Data -> mid-flight
  // 0.85s: Bit error spark glitch!
  // 0.85s - 1.80s: Corrupted packet travels to BS
  // 1.80s - 2.00s: BS detects CRC Mismatch! (Red flash)
  // 2.00s - 3.20s: BS sends NACK -> Laptop (1.2s)
  // 3.20s - 3.50s: Laptop processes NACK -> schedules retransmission (0.3s)
  // 3.50s - 5.10s: Laptop sends RETRANSMIT packet -> BS (1.6s)
  // 5.10s - 6.30s: BS checks CRC (PASS) -> sends ACK -> Laptop (1.2s)
  // 6.30s - 6.80s: Done hold (0.5s)
  // Total error = 6.80s

  const cleanDuration = 3.60;
  const errorDuration = 6.80;
  const cycleDuration = isErrorSimulated ? errorDuration : cleanDuration;

  const cycleTime = simTime % cycleDuration;

  // --- Clean States (isErrorSimulated == false) ---
  const isCleanDataMoving = !isErrorSimulated && cycleTime >= 0 && cycleTime < 1.80;
  const cleanDataProgress = !isErrorSimulated ? Math.min(1, Math.max(0, cycleTime / 1.80)) : 0;
  const isCleanCrcPassed = !isErrorSimulated && cycleTime >= 1.80;
  const isCleanAckMoving = !isErrorSimulated && cycleTime >= 1.80 && cycleTime < 3.00;
  const cleanAckProgress = !isErrorSimulated ? Math.min(1, Math.max(0, (cycleTime - 1.80) / 1.20)) : 0;
  const isCleanDelivered = !isErrorSimulated && cycleTime >= 3.00;

  // --- Error States (isErrorSimulated == true) ---
  const isErrP1Moving = isErrorSimulated && cycleTime >= 0 && cycleTime < 1.80;
  const errP1Progress = isErrorSimulated ? Math.min(1, Math.max(0, cycleTime / 1.80)) : 0;
  const isBitGlitched = isErrorSimulated && cycleTime >= 0.85 && cycleTime < 1.80;
  const isCrcFailedAtBs = isErrorSimulated && cycleTime >= 1.80 && cycleTime < 3.50;

  const isNackMoving = isErrorSimulated && cycleTime >= 2.00 && cycleTime < 3.20;
  const nackProgress = isErrorSimulated ? Math.min(1, Math.max(0, (cycleTime - 2.00) / 1.20)) : 0;
  const isNackAtLaptop = isErrorSimulated && cycleTime >= 3.20 && cycleTime < 3.50;

  const isRetransmitMoving = isErrorSimulated && cycleTime >= 3.50 && cycleTime < 5.10;
  const retransmitProgress = isErrorSimulated ? Math.min(1, Math.max(0, (cycleTime - 3.50) / 1.60)) : 0;
  const isRetransmitCrcPassed = isErrorSimulated && cycleTime >= 5.10;

  const isErrAckMoving = isErrorSimulated && cycleTime >= 5.10 && cycleTime < 6.30;
  const errAckProgress = isErrorSimulated ? Math.min(1, Math.max(0, (cycleTime - 5.10) / 1.20)) : 0;
  const isErrDelivered = isErrorSimulated && cycleTime >= 6.30;

  // Track dispatched protocol events to SimulationPanel
  const lastEventStageRef = useRef<string>('');
  useEffect(() => {
    if (simTime === 0) {
      lastEventStageRef.current = '';
      return;
    }

    if (!isErrorSimulated) {
      // Clean path events
      if (cycleTime >= 0.05 && lastEventStageRef.current !== 'clean_send') {
        lastEventStageRef.current = 'clean_send';
        window.dispatchEvent(new CustomEvent('WIRELESS_SIM_EVENT', {
          detail: {
            no: 1,
            timeFormatted: `${simTime.toFixed(2)}s`,
            timestamp: simTime,
            source: 'Laptop (STA-1)',
            destination: 'Base Station (BS-01)',
            type: 'DATA_PACKET',
            info: 'Frame #1 sent: Payload + CRC-16 (FCS = 0x4A3F) · Channel clean',
            sizeValue: '256 bits',
          }
        }));
      } else if (cycleTime >= 1.80 && lastEventStageRef.current !== 'clean_crc') {
        lastEventStageRef.current = 'clean_crc';
        window.dispatchEvent(new CustomEvent('WIRELESS_SIM_EVENT', {
          detail: {
            no: 2,
            timeFormatted: `${simTime.toFixed(2)}s`,
            timestamp: simTime,
            source: 'Base Station (BS-01)',
            destination: 'Laptop (STA-1)',
            type: 'ACK_BURST',
            info: 'Modulo-2 CRC division remainder = 0 · FCS VALID ✓ · Emitted ACK burst',
            sizeValue: '16 bits',
          }
        }));
      } else if (cycleTime >= 3.00 && lastEventStageRef.current !== 'clean_ack') {
        lastEventStageRef.current = 'clean_ack';
        window.dispatchEvent(new CustomEvent('WIRELESS_SIM_EVENT', {
          detail: {
            no: 3,
            timeFormatted: `${simTime.toFixed(2)}s`,
            timestamp: simTime,
            source: 'Laptop (STA-1)',
            destination: 'Base Station (BS-01)',
            type: 'SYNCHRONIZE',
            info: 'ACK #1 verified by STA-1 · Stop-and-Wait ARQ cycle successfully concluded',
            sizeValue: 'RTT Confirmed',
          }
        }));
      }
    } else {
      // Error path events
      if (cycleTime >= 0.05 && cycleTime < 0.85 && lastEventStageRef.current !== 'err_send') {
        lastEventStageRef.current = 'err_send';
        window.dispatchEvent(new CustomEvent('WIRELESS_SIM_EVENT', {
          detail: {
            no: 1,
            timeFormatted: `${simTime.toFixed(2)}s`,
            timestamp: simTime,
            source: 'Laptop (STA-1)',
            destination: 'Base Station (BS-01)',
            type: 'DATA_PACKET',
            info: 'Frame #1 sent: Payload + CRC-16 (FCS = 0x4A3F) · Impairment active',
            sizeValue: '256 bits',
          }
        }));
      } else if (cycleTime >= 0.85 && cycleTime < 1.80 && lastEventStageRef.current !== 'err_glitch') {
        lastEventStageRef.current = 'err_glitch';
        window.dispatchEvent(new CustomEvent('WIRELESS_SIM_EVENT', {
          detail: {
            no: 2,
            timeFormatted: `${simTime.toFixed(2)}s`,
            timestamp: simTime,
            source: 'RF Noise Channel',
            destination: 'Frame #1 In-Flight',
            type: 'COLLISION',
            info: '💥 Bit inversion spark! Bit 142 flipped: FCS corrupted in-flight',
            sizeValue: 'Bit Glitch',
          }
        }));
      } else if (cycleTime >= 1.80 && cycleTime < 2.00 && lastEventStageRef.current !== 'err_crc_mismatch') {
        lastEventStageRef.current = 'err_crc_mismatch';
        window.dispatchEvent(new CustomEvent('WIRELESS_SIM_EVENT', {
          detail: {
            no: 3,
            timeFormatted: `${simTime.toFixed(2)}s`,
            timestamp: simTime,
            source: 'Base Station (BS-01)',
            destination: 'Laptop (STA-1)',
            type: 'NACK',
            info: '❌ CRC Check Failed: Remainder = 0x7E31 ≠ 0 · Frame rejected · Emitted NACK',
            sizeValue: 'CRC Mismatch',
          }
        }));
      } else if (cycleTime >= 3.20 && cycleTime < 3.50 && lastEventStageRef.current !== 'err_nack_rx') {
        lastEventStageRef.current = 'err_nack_rx';
        window.dispatchEvent(new CustomEvent('WIRELESS_SIM_EVENT', {
          detail: {
            no: 4,
            timeFormatted: `${simTime.toFixed(2)}s`,
            timestamp: simTime,
            source: 'Laptop (STA-1)',
            destination: 'ARQ Retransmit Buffer',
            type: 'RETRANSMIT',
            info: 'NACK burst received at STA-1 · Triggering ARQ Automatic Retransmission',
            sizeValue: 'Retx Buffer',
          }
        }));
      } else if (cycleTime >= 3.50 && cycleTime < 5.10 && lastEventStageRef.current !== 'err_retransmitting') {
        lastEventStageRef.current = 'err_retransmitting';
        window.dispatchEvent(new CustomEvent('WIRELESS_SIM_EVENT', {
          detail: {
            no: 5,
            timeFormatted: `${simTime.toFixed(2)}s`,
            timestamp: simTime,
            source: 'Laptop (STA-1)',
            destination: 'Base Station (BS-01)',
            type: 'RETRANSMIT',
            info: 'RETRANSMIT: Resending Frame #1 (Seq 1) · Clean channel re-attempt',
            sizeValue: '256 bits',
          }
        }));
      } else if (cycleTime >= 5.10 && cycleTime < 6.30 && lastEventStageRef.current !== 'err_retry_passed') {
        lastEventStageRef.current = 'err_retry_passed';
        window.dispatchEvent(new CustomEvent('WIRELESS_SIM_EVENT', {
          detail: {
            no: 6,
            timeFormatted: `${simTime.toFixed(2)}s`,
            timestamp: simTime,
            source: 'Base Station (BS-01)',
            destination: 'Laptop (STA-1)',
            type: 'ACK_BURST',
            info: 'Retransmitted Frame #1 CRC Remainder = 0 · PASSED ✓ · Emitted ACK',
            sizeValue: '16 bits',
          }
        }));
      } else if (cycleTime >= 6.30 && lastEventStageRef.current !== 'err_final_ack') {
        lastEventStageRef.current = 'err_final_ack';
        window.dispatchEvent(new CustomEvent('WIRELESS_SIM_EVENT', {
          detail: {
            no: 7,
            timeFormatted: `${simTime.toFixed(2)}s`,
            timestamp: simTime,
            source: 'Laptop (STA-1)',
            destination: 'Base Station (BS-01)',
            type: 'SYNCHRONIZE',
            info: 'ACK received! CRC error detected and recovered via ARQ retransmission',
            sizeValue: 'ARQ Recovered',
          }
        }));
      }
    }
  }, [cycleTime, isErrorSimulated, simTime]);

  return (
    <div className="w-full h-full flex flex-col p-3 sm:p-5 select-none overflow-y-auto no-pan">
      {/* 1. Top Control Bar: "Simulate Bit Error" Toggle & CRC State */}
      <div className="w-full bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 mb-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Left: Error Injection Toggle Switch */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleError}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border shadow-sm ${
                isErrorSimulated
                  ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/50 shadow-rose-900/20'
                  : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center ${
                  isErrorSimulated ? 'bg-rose-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </div>
              <span className="flex items-center gap-1.5">
                <Flame className={`h-4 w-4 ${isErrorSimulated ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
                <span>Simulate Bit Error: <strong>{isErrorSimulated ? 'ON' : 'OFF'}</strong></span>
              </span>
            </button>

            {/* Error Mode Tag */}
            <span className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border font-semibold hidden md:inline-flex items-center gap-1.5 ${
              isErrorSimulated
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            }`}>
              {isErrorSimulated ? (
                <>
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                  <span>Bit Injected In-Flight → CRC Fails → ARQ NACK Retransmit</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Clean Channel → CRC Passes → Normal ACK Delivery</span>
                </>
              )}
            </span>
          </div>

          {/* Right: CRC Polynomial & FCS Readout */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-slate-600 dark:text-slate-300">
              <span className="text-[10px] text-slate-400 mr-1.5">CRC Generator:</span>
              <strong className="text-cyan-600 dark:text-cyan-400">CRC-16 (X¹⁶+X¹²+X⁵+1)</strong>
            </div>
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-slate-600 dark:text-slate-300">
              <span className="text-[10px] text-slate-400 mr-1.5">FCS Checksum:</span>
              <strong className={isBitGlitched ? 'text-rose-500 line-through' : 'text-emerald-600 dark:text-emerald-400'}>
                0x4A3F
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Topology Canvas Stage (Star Link: Laptop <-> Base Station) */}
      <div className="w-full flex-1 min-h-[260px] sm:min-h-[300px] bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 shadow-inner">
        {/* Subtle Radar Ring Effect */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <div className="w-80 h-80 rounded-full border border-cyan-500/40" />
          <div className="w-[480px] h-[480px] rounded-full border border-cyan-500/20 absolute" />
        </div>

        {/* Central Link Row */}
        <div className="relative z-10 w-full max-w-2xl flex items-center justify-between px-2 sm:px-6 my-auto">
          {/* Node 1: Laptop (Transmitter) */}
          <div className="flex flex-col items-center">
            <div
              className={`relative flex h-22 w-22 sm:h-26 sm:w-26 flex-col items-center justify-center rounded-2xl border transition-all duration-300 ${
                isCleanDelivered || isErrDelivered
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400/50'
                  : isNackAtLaptop || isRetransmitMoving
                  ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/50'
                  : isCleanDataMoving || isErrP1Moving
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-900/80 border-slate-700/80'
              }`}
            >
              <LaptopIcon
                size={38}
                color={
                  isCleanDelivered || isErrDelivered
                    ? '#10b981'
                    : isNackAtLaptop || isRetransmitMoving
                    ? '#f59e0b'
                    : isCleanDataMoving || isErrP1Moving
                    ? '#06b6d4'
                    : '#94a3b8'
                }
                glow={isCleanDataMoving || isErrP1Moving || isRetransmitMoving}
              />
              <span className="text-[10px] font-mono font-bold text-white mt-1">STA-1 (Laptop)</span>
              <span className="text-[8px] font-mono text-cyan-400 font-semibold">ARQ Sender</span>

              {/* Retransmit indicator badge on laptop */}
              {(isNackAtLaptop || isRetransmitMoving) && (
                <span className="absolute -top-2.5 -right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono font-bold text-[8px] flex items-center gap-0.5 shadow-md animate-bounce">
                  <RotateCcw className="h-2.5 w-2.5" />
                  <span>RETRY</span>
                </span>
              )}

              {/* Final ACK delivered badge */}
              {(isCleanDelivered || isErrDelivered) && (
                <span className="absolute -top-2.5 -right-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono font-bold text-[8px] flex items-center gap-0.5 shadow-md">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  <span>ACK ✓</span>
                </span>
              )}
            </div>

            <div className="mt-1.5 text-center">
              <span className="text-[9px] font-mono text-slate-400">
                {isCleanDelivered || isErrDelivered
                  ? 'Round-trip OK ✓'
                  : isNackAtLaptop
                  ? 'NACK Received! Resending...'
                  : isRetransmitMoving
                  ? 'Transmitting Retry #1'
                  : isCleanDataMoving || isErrP1Moving
                  ? 'Transmitting Frame #1'
                  : 'Ready'}
              </span>
            </div>
          </div>

          {/* Central Physical RF Link */}
          <div className="flex-1 mx-3 sm:mx-6 flex flex-col items-center relative">
            <div className="w-full h-2.5 bg-slate-800 rounded-full relative overflow-visible flex items-center">
              {/* Pipe guide gradient */}
              <div className="w-full h-full bg-gradient-to-r from-cyan-500/30 via-slate-700/30 to-purple-500/30 rounded-full" />

              {/* Mid-flight Glitch Hazard Marker (When Error is ON) */}
              {isErrorSimulated && (
                <div
                  className="absolute left-[45%] -top-4 -bottom-4 w-8 flex flex-col items-center justify-center pointer-events-none"
                  style={{ transform: 'translateX(-50%)' }}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                    isBitGlitched ? 'bg-rose-500/30 border border-rose-500 animate-ping' : 'opacity-20'
                  }`}>
                    <Zap className="h-4 w-4 text-rose-500" />
                  </div>
                </div>
              )}

              {/* --- 1. Clean Data Packet Travel: Laptop -> BS (t=0.00s to 1.80s) --- */}
              {isCleanDataMoving && (
                <motion.div
                  className="absolute -top-3.5 h-7 px-2.5 rounded-lg bg-cyan-400 text-slate-950 flex items-center justify-center font-mono font-bold text-[9px] shadow-[0_0_12px_#22d3ee] border border-cyan-200 z-20 whitespace-nowrap"
                  style={{
                    left: `${cleanDataProgress * 100}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  DATA [FCS: 0x4A3F]
                </motion.div>
              )}

              {/* --- 2. Clean ACK Packet Travel: BS -> Laptop (t=1.80s to 3.00s) --- */}
              {isCleanAckMoving && (
                <motion.div
                  className="absolute -top-3.5 h-7 px-2.5 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-mono font-bold text-[9px] shadow-[0_0_14px_#10b981] border border-emerald-200 z-30 whitespace-nowrap"
                  style={{
                    left: `${(1 - cleanAckProgress) * 100}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  ACK [16b]
                </motion.div>
              )}

              {/* --- 3. Corrupted Data Packet Travel (Error ON, t=0.00s to 1.80s) --- */}
              {isErrP1Moving && (
                <motion.div
                  className={`absolute -top-4 h-8 px-2.5 rounded-lg flex items-center justify-center font-mono font-bold text-[9px] z-20 whitespace-nowrap border transition-all ${
                    isBitGlitched
                      ? 'bg-rose-500 text-white shadow-[0_0_16px_#f43f5e] border-rose-200 ring-2 ring-rose-400 animate-pulse'
                      : 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_#22d3ee] border-cyan-200'
                  }`}
                  style={{
                    left: `${errP1Progress * 100}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  {isBitGlitched ? (
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-yellow-300 animate-bounce" />
                      <span>CORRUPT [BIT FLIPPED 💥]</span>
                    </span>
                  ) : (
                    <span>DATA [Seq 1 · FCS: 0x4A3F]</span>
                  )}
                </motion.div>
              )}

              {/* --- 4. Return NACK Packet Travel: BS -> Laptop (Error ON, t=2.00s to 3.20s) --- */}
              {isNackMoving && (
                <motion.div
                  className="absolute -top-3.5 h-7 px-2.5 rounded-lg bg-rose-600 text-white flex items-center justify-center font-mono font-bold text-[9px] shadow-[0_0_14px_#f43f5e] border border-rose-300 z-30 whitespace-nowrap animate-pulse"
                  style={{
                    left: `${(1 - nackProgress) * 100}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-yellow-300" />
                    <span>NACK [Retransmit Req]</span>
                  </span>
                </motion.div>
              )}

              {/* --- 5. Retransmit Data Packet Travel: Laptop -> BS (Error ON, t=3.50s to 5.10s) --- */}
              {isRetransmitMoving && (
                <motion.div
                  className="absolute -top-3.5 h-7 px-2.5 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-mono font-bold text-[9px] shadow-[0_0_14px_#fbbf24] border border-amber-200 z-20 whitespace-nowrap"
                  style={{
                    left: `${retransmitProgress * 100}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <span className="flex items-center gap-1">
                    <RotateCcw className="h-3 w-3 text-slate-950" />
                    <span>RETRANSMIT [Seq 1 · Clean]</span>
                  </span>
                </motion.div>
              )}

              {/* --- 6. Final ACK Packet Travel after Retransmit: BS -> Laptop (Error ON, t=5.10s to 6.30s) --- */}
              {isErrAckMoving && (
                <motion.div
                  className="absolute -top-3.5 h-7 px-2.5 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-mono font-bold text-[9px] shadow-[0_0_14px_#10b981] border border-emerald-200 z-30 whitespace-nowrap"
                  style={{
                    left: `${(1 - errAckProgress) * 100}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  ACK [Seq 1 Verified]
                </motion.div>
              )}
            </div>

            {/* In-Flight Pipe Status Label */}
            <span className="text-[9px] font-mono text-slate-400 mt-3 text-center">
              {isCleanDataMoving
                ? 'Link: Data Packet In Transit (1.8s)'
                : isCleanAckMoving
                ? 'Link: ACK Returning to STA-1 (1.2s)'
                : isErrP1Moving
                ? isBitGlitched
                  ? 'Link: 💥 Noise Spike Inverted Bit in FCS!'
                  : 'Link: Data Packet Travelling'
                : isNackMoving
                ? 'Link: NACK Burst Returning (Retransmit Requested)'
                : isRetransmitMoving
                ? 'Link: RETRANSMIT Packet En Route'
                : isErrAckMoving
                ? 'Link: Recovery ACK Returning'
                : 'Channel Ready'}
            </span>
          </div>

          {/* Node 2: Base Station (Receiver & CRC Arbiter) */}
          <div className="flex flex-col items-center">
            <div
              className={`relative flex h-24 w-24 sm:h-28 sm:w-28 flex-col items-center justify-center rounded-2xl border transition-all duration-300 ${
                isCrcFailedAtBs
                  ? 'bg-rose-950/60 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.6)] ring-2 ring-rose-500/60'
                  : isCleanCrcPassed || isRetransmitCrcPassed
                  ? 'bg-purple-950/60 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400/50'
                  : isCleanDataMoving || isErrP1Moving || isRetransmitMoving
                  ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-900/80 border-slate-700/80'
              }`}
            >
              <BaseStationIcon
                size={44}
                color={
                  isCrcFailedAtBs
                    ? '#f43f5e'
                    : isCleanCrcPassed || isRetransmitCrcPassed
                    ? '#10b981'
                    : '#a855f7'
                }
                glow={isCleanCrcPassed || isRetransmitCrcPassed || isCrcFailedAtBs}
              />
              <span className="text-[11px] font-mono font-bold text-white mt-0.5">BS-01 (Tower)</span>
              <span className="text-[8px] font-mono text-purple-300 font-semibold">CRC Decoupler</span>

              {/* CRC Error Flash Banner */}
              {isCrcFailedAtBs && (
                <div className="absolute -top-3.5 px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono font-bold text-[8px] flex items-center gap-1 shadow-lg ring-1 ring-rose-300 animate-pulse">
                  <ShieldAlert className="h-3 w-3" />
                  <span>CRC MISMATCH!</span>
                </div>
              )}

              {/* CRC Valid Flash Banner */}
              {(isCleanCrcPassed || isRetransmitCrcPassed) && !isCrcFailedAtBs && (
                <div className="absolute -top-3.5 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono font-bold text-[8px] flex items-center gap-1 shadow-lg">
                  <ShieldCheck className="h-3 w-3" />
                  <span>CRC VALID ✓</span>
                </div>
              )}
            </div>

            <div className="mt-1.5 text-center">
              <span
                className={`text-[9px] font-mono font-bold ${
                  isCrcFailedAtBs
                    ? 'text-rose-400'
                    : isCleanCrcPassed || isRetransmitCrcPassed
                    ? 'text-emerald-400'
                    : 'text-purple-400'
                }`}
              >
                {isCrcFailedAtBs
                  ? 'Remainder ≠ 0 (NACK Sent)'
                  : isCleanCrcPassed || isRetransmitCrcPassed
                  ? 'FCS OK (ACK Dispatched)'
                  : 'Monitoring Uplink'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Protocol Explanation Strip */}
      <div className="w-full mt-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
        <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800 mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span className="text-white font-bold uppercase tracking-wider text-[11px]">
              CRC Error Detection & ARQ Retransmission Protocol States
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            802.16 MAC Header HCS + ARQ Bit (§11.3)
          </span>
        </div>

        {/* 4 Multi-step Protocol Buttons (Clickable to scrub simulation timeline) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          {/* Step 1 */}
          <button
            onClick={() => setSimTime(0.20)}
            title="Click to jump to Step 1: Modulo-2 Encoding & Frame Transmission"
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
              (isCleanDataMoving || isErrP1Moving) && cycleTime < 1.80
                ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/50 shadow-md scale-[1.02]'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-500 uppercase font-bold">Step 1: Encode</span>
              <span className="text-[8px] text-cyan-400/80 font-mono">0.2s ↷</span>
            </div>
            <span className="font-bold text-slate-100 block truncate">Append FCS = R(X)</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Transmit frame to BS</span>
          </button>

          {/* Step 2 */}
          <button
            onClick={() => setSimTime(1.85)}
            title="Click to jump to Step 2: CRC Modulo-2 Check at Base Station"
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
              (cycleTime >= 1.80 && cycleTime < 2.00) || (cycleTime >= 1.80 && !isErrorSimulated && cycleTime < 2.50)
                ? isCrcFailedAtBs
                  ? 'bg-rose-950/60 border-rose-400 text-rose-300 ring-2 ring-rose-400/50 shadow-md scale-[1.02]'
                  : 'bg-emerald-950/60 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/50 shadow-md scale-[1.02]'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-500 uppercase font-bold">Step 2: CRC Check</span>
              <span className="text-[8px] text-purple-400/80 font-mono">1.85s ↷</span>
            </div>
            <span className="font-bold text-slate-100 block truncate">
              {isCrcFailedAtBs ? 'Remainder ≠ 0 (FAIL)' : (isCleanCrcPassed || isRetransmitCrcPassed) ? 'Remainder = 0 (PASS)' : 'T(X) / P(X) Div'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">BS evaluates syndrome</span>
          </button>

          {/* Step 3 */}
          <button
            onClick={() => {
              if (!isErrorSimulated && setSimulateBitError) {
                setSimulateBitError(true);
              }
              setSimTime(2.40);
            }}
            title="Click to jump to Step 3: ARQ Negative ACK (NACK) Return"
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
              isErrorSimulated && cycleTime >= 2.00 && cycleTime < 3.50
                ? 'bg-rose-950/60 border-rose-400 text-rose-300 ring-2 ring-rose-400/50 shadow-md scale-[1.02]'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-500 uppercase font-bold">Step 3: ARQ NACK</span>
              <span className="text-[8px] text-rose-400/80 font-mono">2.40s ↷</span>
            </div>
            <span className="font-bold text-slate-100 block truncate">
              {isNackMoving || isNackAtLaptop ? 'NACK Emitted ⚠️' : 'NACK on Failure'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Fast retransmit request</span>
          </button>

          {/* Step 4 */}
          <button
            onClick={() => setSimTime(isErrorSimulated ? 4.20 : 2.40)}
            title="Click to jump to Step 4: Retransmit & ACK"
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
              (isErrorSimulated && cycleTime >= 3.50) || (!isErrorSimulated && cycleTime >= 2.50)
                ? 'bg-amber-950/60 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 shadow-md scale-[1.02]'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-500 uppercase font-bold">Step 4: Retransmit & ACK</span>
              <span className="text-[8px] text-amber-400/80 font-mono">{isErrorSimulated ? '4.2s ↷' : '2.4s ↷'}</span>
            </div>
            <span className="font-bold text-slate-100 block truncate">
              {isCleanDelivered || isErrDelivered ? 'ACK Confirmed ✓' : isRetransmitMoving ? 'Retrying Payload' : 'Clean ACK on OK'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Recovery & RTT close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
