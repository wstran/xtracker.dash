import { useEffect } from "react";
import { useSession } from "next-auth/react";
import {useRouter} from "next/router";

const Index = () => {
  const router = useRouter()

  const { data: session } = useSession();

  useEffect(() => {
    if (session && (session as any).user?.role !== "subscriber") {
      router.push('/influencer').catch(console.error);
    }
  }, [session]);

  return (
    <>
      {session && (session as any).user?.role === "subscriber" && (
        <div className="relative flex items-center rounded border border-danger bg-danger-light p-3.5 text-danger before:absolute before:top-1/2 before:-mt-2 before:inline-block before:border-b-8 before:border-r-8 before:border-t-8 before:border-b-transparent before:border-r-inherit before:border-t-transparent ltr:border-r-[64px] ltr:before:right-0 rtl:border-l-[64px] rtl:before:left-0 rtl:before:rotate-180 dark:bg-danger-dark-light">
          <span className="absolute inset-y-0 m-auto h-6 w-6 text-white ltr:-right-11 rtl:-left-11">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                opacity="0.5"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path d="M12 7V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
            </svg>
          </span>
          <span className="ltr:pr-2 rtl:pl-2">
            <strong className="ltr:mr-1 rtl:ml-1">Warning!</strong>You don't have access to this
            page.
          </span>
          <button type="button" className="hover:opacity-80 ltr:ml-auto rtl:mr-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

export default Index;
