export default function StatsBar() {
    const stats = [
        { id: 1, name: 'Years of Experience', value: '25 Th' },
        { id: 2, name: 'Successful Creators', value: '720 +' },
        { id: 3, name: 'Investment Returns', value: '97 %' },
        { id: 4, name: 'Individual Teams', value: '150 +' },
    ];

    return (
        <div className="bg-primary py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.id} className="mx-auto flex max-w-xs flex-col gap-y-4">
                            <dt className="text-base leading-7 text-white/80">{stat.name}</dt>
                            <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl font-heading">
                                {stat.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </div>
    );
}
