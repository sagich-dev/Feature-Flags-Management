import { Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

interface TableSkeletonProps {
	rows?: number;
	columns?: number;
}

/**
 * Skeleton loader for table structure
 */
export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
	return (
		<TableContainer>
			<Table>
				<TableHead>
					<TableRow>
						{Array.from({ length: columns }, (_, index) => index).map((colIndex) => (
							<TableCell key={`header-${colIndex}`}>
								<Skeleton variant="text" width={colIndex === 0 ? 200 : 120} height={24} />
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{Array.from({ length: rows }, (_, index) => index).map((rowIndex) => (
						<TableRow key={`row-${rowIndex}`}>
							{Array.from({ length: columns }, (_, index) => index).map((colIndex) => (
								<TableCell key={`row-${rowIndex}-col-${colIndex}`}>
									<Skeleton variant="text" width={colIndex === 0 ? 200 : 80} height={20} />
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
