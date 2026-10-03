import { cn } from "@/lib/utils";
import type { LucideIcon, LucideProps } from "lucide-react-native";
import { cssInterop } from "nativewind";

function IconImpl({ icon: IconComponent, ...props }: LucideProps & { icon: LucideIcon }) {
  return <IconComponent {...props} />;
}

cssInterop(IconImpl, {
  className: {
    target: "style",
    nativeStyleToProp: {
      color: true,
      opacity: true,
    },
  },
});

/**
 * Themed lucide icon: color comes from a token class, e.g.
 * <Icon as={Plus} className="text-foreground" size={22} />
 */
function Icon({
  as: IconComponent,
  className,
  size = 14,
  ...props
}: Omit<LucideProps, "ref"> & {
  as: LucideIcon;
  className?: string;
}) {
  return (
    <IconImpl
      icon={IconComponent}
      className={cn("text-foreground", className)}
      size={size}
      {...(props as object)}
    />
  );
}

export { Icon };
