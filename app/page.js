import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ArrowRight,
  LogIn,
  UserPlus,
  TrendingUp,
  Shield,
  BarChart3,
  Wallet,
} from "lucide-react";
import { websiteDetails } from "@/data/website";

export default function Home() {
  return (
    <div className="container mx-auto min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo and Title */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-3 rounded-full bg-primary/10">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              {websiteDetails.websiteName}
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Take control of your finances with our powerful personal finance
            tracker
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/sign-up" className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="/sign-in" className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Sign In
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 md:mt-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything you need to manage your money
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bank Accounts</h3>
              <p className="text-muted-foreground">
                Track all your bank accounts in one place with real-time balance
                updates
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transactions</h3>
              <p className="text-muted-foreground">
                Monitor income, expenses, and transfers with detailed
                categorization
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics</h3>
              <p className="text-muted-foreground">
                Get insights into your spending patterns with comprehensive
                reports and charts
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your financial data is encrypted and stored securely with
                industry-standard security
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 md:mt-32 text-center">
          <div className="p-8 md:p-12 rounded-2xl border bg-card">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to take control of your finances?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join thousands of users who are already managing their money
              smarter with {websiteDetails.websiteName}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/sign-up" className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Create Free Account
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/sign-in" className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Sign In to Existing Account
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
