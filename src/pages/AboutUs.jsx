export default function AboutUs() {
  return (
    <section className="min-h-screen bg-stone-200 py-10 px-4 sm:py-16">
      <div className="max-w-screen-xl mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-slate-800 sm:text-4xl md:text-5xl">
            About Us
          </h1>

          <p className="mt-4 text-slate-500 text-lg">
            Making the admission journey a little easier
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-sm">
          <div className="space-y-6 text-slate-600 leading-8 text-lg">

            <p>
              Every year, thousands of students across Bangladesh go through
              the stressful journey of university admission. From keeping
              track of circulars and important dates to checking application
              updates, there is already so much for a student to worry about.
            </p>

            <p>
              We believe that finding the right information should not have to
              be another source of stress. Students deserve a simple and
              organized place where they can find the information they need,
              when they need it.
            </p>

            <p>
              <span className="font-semibold text-[#805827]">Admito</span> is
              our small effort to make that journey a little easier. We
              created this platform with students in mind — to bring admission
              circulars, important dates, application information, and other
              useful resources together in one place.
            </p>

            <p>
              We know that the admission journey can feel overwhelming, and
              while we cannot take away all of its challenges, we hope Admito
              can make at least one part of it simpler.
            </p>

            <p className="font-medium text-slate-700">
              This is a small project, but it comes from a simple idea:
              students already have enough to worry about. Finding important
              admission information shouldn't be one of them.
            </p>

          </div>
        </div>

      </div>
    </section>
  );
}