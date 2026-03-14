import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Users, BrainCircuit, ShieldCheck, ArrowRight, Play, FileText, CheckCircle2 } from "lucide-react";

const Landing = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-inter overflow-hidden">
      {/* Navbar overlay logic will be handled in Navbar.jsx with solid/transparent states */}
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/50 rounded-full blur-3xl mix-blend-multiply opacity-70"></div>
          <div className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] bg-purple-200/50 rounded-full blur-3xl mix-blend-multiply opacity-70"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl mix-blend-multiply opacity-70"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-6"
            >
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
              The Future of Indian Education
            </motion.div>
            
            <motion.h1 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight"
            >
              Learn faster. <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Teach smarter.
              </span>
            </motion.h1>
            
            <motion.p 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Pro Classroom brings AI-powered plagiarism detection, seamless assignment management, and intuitive class organization to empower educators and students across India.
            </motion.p>
            
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="flex flex-col sm:flex-row justify-center items-center gap-4"
            >
              <Link 
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 group"
              >
                Get Started for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#features"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-gray-700 font-bold text-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 text-indigo-600 fill-indigo-100" />
                See How It Works
              </a>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative max-w-5xl mx-auto"
          >
            <div className="relative rounded-2xl md:rounded-[2rem] bg-indigo-900/5 p-2 md:p-4 border border-white/40 shadow-2xl backdrop-blur-sm">
              <div className="rounded-xl md:rounded-[1.5rem] overflow-hidden border border-gray-200 shadow-sm">
                <video
                  src="/Homepage.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto block"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Trust Section */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
            Trusted by Modern Indian Institutions
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Students", value: "10,000+" },
              { label: "Classes Created", value: "500+" },
              { label: "Assignments Assessed", value: "50,000+" },
              { label: "Plagiarism Detected", value: "99.9% Accuracy" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-extrabold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-indigo-600 font-bold tracking-wide uppercase text-sm mb-3">Core Features</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">Everything you need to run a modern classroom.</h3>
            <p className="text-gray-600 text-lg">Designed specifically to bridge the gap between rigorous assessment and smooth digital workflows.</p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                title: "AI Plagiarism Checker",
                desc: "Built-in NLP instantly compares student submissions against classmates to ensure academic integrity.",
                icon: <BrainCircuit className="w-6 h-6 text-purple-600" />,
                bg: "bg-purple-50",
                border: "border-purple-100"
              },
              {
                title: "Instant PDF Parsing",
                desc: "Students upload PDFs, and our fast backend extracts text securely for immediate similarity scoring.",
                icon: <FileText className="w-6 h-6 text-blue-600" />,
                bg: "bg-blue-50",
                border: "border-blue-100"
              },
              {
                title: "Unified Teacher Dashboard",
                desc: "Get a bird's-eye view of all classes, assignments, and high-risk submissions in one clean interface.",
                icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
                bg: "bg-green-50",
                border: "border-green-100"
              },
              {
                title: "Seamless Student Portal",
                desc: "Students can join via class codes, view crisp assignment details, and track their submission status.",
                icon: <Users className="w-6 h-6 text-indigo-600" />,
                bg: "bg-indigo-50",
                border: "border-indigo-100"
              },
              {
                title: "Bank-Grade Security",
                desc: "JWT authentication and bcrypt hashing keep student and teacher data completely secure.",
                icon: <ShieldCheck className="w-6 h-6 text-teal-600" />,
                bg: "bg-teal-50",
                border: "border-teal-100"
              },
              {
                title: "Organized Classes",
                desc: "Teachers can create multiple classes. Every assignment belongs exactly where it should.",
                icon: <BookOpen className="w-6 h-6 text-rose-600" />,
                bg: "bg-rose-50",
                border: "border-rose-100"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                variants={fadeIn}
                className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.bg} ${feature.border} border`}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900 -z-20"></div>
        {/* Abstract pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] -z-10"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Ready to upgrade your teaching?
          </h2>
          <p className="text-indigo-200 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of educators leveraging Pro Classroom to manage assignments and maintain academic integrity.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/login"
              className="px-8 py-4 rounded-xl bg-white text-indigo-900 font-bold text-lg hover:bg-gray-50 hover:scale-105 transition-all shadow-xl shadow-indigo-900/20"
            >
              Start Teaching Free
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
              pro<span className="text-indigo-600">Classroom</span>
            </span>
          </div>
          <p className="text-gray-500 font-medium">
            © {new Date().getFullYear()} Pro Classroom. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors font-medium">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors font-medium">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
