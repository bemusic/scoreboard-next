import {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from 'next'
import { getLeaderboard } from '@/app/scoreboard'
import { calculateAccuracy, formatAccuracy } from '@/packlets/bemuse-scoreboard'
import { FC, useEffect, useMemo } from 'react'

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const md5 = String(context.query.md5)
  const playMode = String(context.query.playMode)
  const leaderboard = await getLeaderboard(md5, playMode)
  return {
    props: {
      md5,
      playMode,
      leaderboard,
    },
  }
}

const ScoreboardPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ md5, playMode, leaderboard: { data } }) => {
  return (
    <div className="xl:container p-3">
      <div className="prose max-w-none">
        <h1>Leaderboard</h1>
        <p>
          {md5}, {playMode}
        </p>
        <div className="not-prose">
          <table className="table table-compact w-full">
            <thead>
              <tr>
                <th className="text-right">Rank</th>
                <th className="text-center">Name</th>
                <th className="text-right">Accuracy</th>
                <th className="text-right">Combo</th>
                <th className="text-right">Score</th>
                <th className="text-center">Recorded</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td className="text-right">{row.rank}</td>
                  <td className="text-center">
                    <strong>{row.entry.player.name}</strong>
                  </td>
                  <td className="text-right">
                    {row.entry.combo}
                    <small className="opacity-75">/{row.entry.total}</small>
                  </td>
                  <td className="text-right">
                    {formatAccuracy(
                      calculateAccuracy(row.entry.count, row.entry.total),
                    )}
                  </td>
                  <td className="text-right">{row.entry.score}</td>
                  <td className="text-center">
                    <RelativeTime time={row.entry.recordedAt} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export interface RelativeTime {
  time: string
}

export const RelativeTime: FC<RelativeTime> = (props) => {
  useEffect(() => {
    import('@github/time-elements')
  }, [])
  return (
    <relative-time datetime={props.time} tense="past">
      {props.time}
    </relative-time>
  )
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'relative-time': any
    }
  }
}

export default ScoreboardPage
