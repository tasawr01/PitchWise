import Spinner from '@/components/Spinner';

export default function Loading() {
    return (
        <div className="flex h-[50vh] w-full items-center justify-center">
            <Spinner className="w-12 h-12 text-[#0B2C4A]" />
        </div>
    );
}
