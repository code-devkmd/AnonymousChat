import { LoaderCircle } from "lucide-react";

export default function Loading() {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <LoaderCircle
                    size={40}
                    className="animate-spin text-slate-700"
                />

                <div className="text-center">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Loading room
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Please wait while we connect you...
                    </p>
                </div>
            </div>
        </div>
    );
}