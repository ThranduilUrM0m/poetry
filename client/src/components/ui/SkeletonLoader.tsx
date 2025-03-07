import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SkeletonLoader = () => {
    return (
        <div className="p-4">
            <Skeleton height={40} width={200} className="mb-4" /> {/* Title */}
            <Skeleton count={5} className="mb-2" /> {/* Paragraphs */}
            <Skeleton height={200} className="w-full" /> {/* Image */}
        </div>
    );
};

export default SkeletonLoader;
