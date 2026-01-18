import { Box, Card, Skeleton, Stack } from "@mui/material";

interface CardSkeletonProps {
	count?: number;
}

/**
 * Skeleton loader for card list structure
 */
export function CardSkeleton({ count = 3 }: CardSkeletonProps) {
	return (
		<Stack spacing={2} sx={{ p: 2 }}>
			{Array.from({ length: count }, (_, index) => index).map((cardIndex) => (
				<Card key={`card-skeleton-${cardIndex}`} sx={{ p: 2.5 }}>
					<Stack spacing={2}>
						<Box>
							<Skeleton variant="rectangular" width={120} height={24} sx={{ borderRadius: 1, mb: 1 }} />
							<Skeleton variant="text" width="80%" height={24} />
							<Skeleton variant="text" width="60%" height={20} />
						</Box>
						<Box>
							<Skeleton variant="text" width={60} height={16} sx={{ mb: 1 }} />
							<Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
						</Box>
						<Stack spacing={1.5}>
							{Array.from({ length: 4 }, (_, index) => index).map((envIndex) => (
								<Box
									key={`card-${cardIndex}-env-${envIndex}`}
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										p: 1.5,
										borderRadius: 1,
										border: "1px solid",
										borderColor: "divider",
									}}
								>
									<Skeleton variant="text" width={80} height={20} />
									<Skeleton variant="rectangular" width={58} height={34} sx={{ borderRadius: 2 }} />
								</Box>
							))}
						</Stack>
						<Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", pt: 1 }}>
							<Skeleton variant="circular" width={32} height={32} />
							<Skeleton variant="circular" width={32} height={32} />
						</Box>
					</Stack>
				</Card>
			))}
		</Stack>
	);
}
