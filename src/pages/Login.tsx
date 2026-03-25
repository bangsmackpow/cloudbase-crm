import React from 'react';

const Login = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary p-6">
      <div className="glass w-full max-w-md rounded-3xl p-10 shadow-md animate-in fade-in zoom-in-95 duration-700">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-blue text-white shadow-lg">
            <span className="text-2xl font-bold">C</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Chalkboard</h1>
          <p className="text-secondary mt-2">Sign in to your organization workspace</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary">Organization Subdomain</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="my-company"
                className="w-full rounded-xl border bg-bg-secondary px-4 py-3 outline-none focus:ring-2 focus:ring-accent-blue/20 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary font-medium">.chalkboard.com</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary">Email Address</label>
            <input 
              type="email" 
              placeholder="luc.picard@enterprise.com"
              className="w-full rounded-xl border bg-bg-secondary px-4 py-3 outline-none focus:ring-2 focus:ring-accent-blue/20 transition-all"
            />
          </div>

          <button className="w-full rounded-xl bg-accent-blue py-3 font-semibold text-white shadow-md hover:opacity-90 active:scale-[0.98] transition-all">
            Continue with Magic Link
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-secondary">
          New to Chalkboard? <a href="#" className="font-semibold text-accent-blue hover:underline">Create a workspace</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
