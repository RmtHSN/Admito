import { Link } from "react-router-dom";
import { Reveal } from "./Reveal";

export default function Features() {
  return (
    <section id="features" className="bg-stone-200">
      <div className="py-10 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-6">

        <h2 className="mb-4 text-3xl font-semibold tracking-tight text-slate-800 md:text-4xl">
          Everything your admission needs, in one place
        </h2>
        <p className="mb-12 font-normal text-slate-500 lg:text-lg sm:px-16 xl:px-48">
          Here's what you'll find as soon as you log in to Admito
        </p>

        <div className="grid pt-8 text-left border-t border-slate-300 md:grid-cols-3 md:gap-12">

          {/* Recent Circulars */}
          <Reveal delay={0} className="card-lift rounded-2xl p-5">
            <div className="flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-[#805827]/10 lg:h-12 lg:w-12">
              <svg
                className="w-5 h-5 text-[#805827] lg:w-6 lg:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                  d="M3 8l9-5 9 5-9 5-9-5zm0 0v8l9 5 9-5V8"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-slate-800">
              Recent Circulars
            </h3>
            <p className="text-slate-500">
              Stay on top of every notice the admission office publishes, from
              merit lists to document deadlines, the moment they go live.
            </p>
            <Link
              to="/circulars"
              className="inline-flex items-center mt-3 text-sm font-medium text-[#805827] hover:text-[#FFD700]"
            >
              View all circulars
              <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </Reveal>

          {/* Application Status */}
          <Reveal delay={120} className="card-lift rounded-2xl p-5">
            <div className="flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-[#805827]/10 lg:h-12 lg:w-12">
              <svg
                className="w-5 h-5 text-[#805827] lg:w-6 lg:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-slate-800">
              Application Status
            </h3>
            <p className="text-slate-500">
              Enter your application ID and see exactly where you stand —
              submitted, under review, or admitted — without waiting on an
              email.
            </p>
            <Link
              to="/applications"
              className="inline-flex items-center mt-3 text-sm font-medium text-[#805827] hover:text-[#FFD700]"
            >
              Check your status
              <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </Reveal>

          {/* Important Dates -> routes to /important-dates */}
          <Reveal delay={240} className="card-lift rounded-2xl p-5">
            <div className="flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-[#805827]/10 lg:h-12 lg:w-12">
              <svg
                className="w-5 h-5 text-[#805827] lg:w-6 lg:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-slate-800">
              Important Dates
            </h3>
            <p className="text-slate-500">
              Applications close, exams sit, and merit lists drop on fixed
              dates. Keep the full admission calendar one tap away.
            </p>
            <Link
              to="/important-dates"
              className="inline-flex items-center mt-3 text-sm font-medium text-[#805827] hover:text-[#FFD700]"
            >
              See the full calendar
              <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </Reveal>

        </div>
      </div>
    </section>
  );
}