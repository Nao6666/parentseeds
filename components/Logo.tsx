import Image from 'next/image';

export default function Logo() {
  return (
    <span className="flex items-center w-full">
      <Image
        src="/parentseed-logo.jpg"
        alt="ParentSeed"
        width={200}
        height={60}
        className="w-full h-auto max-h-12 object-contain"
      />
    </span>
  );
} 