// import { trpc } from "../trpc";

export function useEmailVerifyCheck() {
  // const emailCheck = trpc.viewer.shouldVerifyEmail.useQuery(undefined, {
  //   retry(failureCount) {
  //     return failureCount > 3;
  //   },
  // });

  return { data: { isVerified: true }, isLoading: false }; //fake
}

export default useEmailVerifyCheck;
