"use client";

import { useCallback, useState } from "react";

import {
  completeProductChallenge,
  revealProductHandle,
  type ActionPublicDetail,
} from "@/entities/pharmacy";
import { ApiError } from "@/shared/api/base";

export interface RevealChallenge {
  handle: string;
  requestToken: string;
}

export function getChallengeRequestToken(error: unknown): string | null {
  if (!(error instanceof ApiError) || error.status !== 428) return null;
  if (error.problem?.code !== "CHALLENGE_REQUIRED") return null;
  const token = error.problem.challenge?.request_token;
  return typeof token === "string" && token.length > 0 ? token : null;
}

export function isChallengeRequired(error: unknown): boolean {
  return getChallengeRequestToken(error) !== null;
}

export function getChallengeErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.problem?.title) {
    return error.problem.title;
  }
  return "Η επαλήθευση απέτυχε. Δοκιμάστε ξανά.";
}

export function useRevealWithChallenge() {
  const [challenge, setChallenge] = useState<RevealChallenge | null>(null);
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const reveal = useCallback(async (handle: string): Promise<ActionPublicDetail | null> => {
    setChallenge(null);
    setChallengeError(null);
    try {
      return await revealProductHandle(handle);
    } catch (error) {
      const requestToken = getChallengeRequestToken(error);
      if (requestToken) {
        setChallenge({ handle, requestToken });
        return null;
      }
      throw error;
    }
  }, []);

  const verifyChallenge = useCallback(async (providerToken: string) => {
    if (!challenge) return null;
    setIsVerifying(true);
    setChallengeError(null);
    try {
      await completeProductChallenge(challenge.requestToken, providerToken);
      const detail = await revealProductHandle(challenge.handle);
      setChallenge(null);
      return detail;
    } catch (error) {
      // A fresh 428 after verification means the previous token was consumed
      // elsewhere; adopt the new request token so the widget can retry
      // instead of replaying the stale one.
      const nextRequestToken = getChallengeRequestToken(error);
      if (nextRequestToken && challenge) {
        setChallenge({ handle: challenge.handle, requestToken: nextRequestToken });
        setChallengeError(null);
      } else {
        setChallengeError(getChallengeErrorMessage(error));
      }
      throw error;
    } finally {
      setIsVerifying(false);
    }
  }, [challenge]);

  return {
    challenge,
    challengeError,
    isVerifying,
    reveal,
    verifyChallenge,
  };
}
