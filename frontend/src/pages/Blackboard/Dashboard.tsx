import Layout from '../../components/Blackboard/Layout'
import Welcome from '../../components/Blackboard/Welcome'
import ActivitiesGrid from '../../components/Blackboard/ActivitiesGrid'
import UserProgress from '../../components/Blackboard/UserProgress'
import Recommendations from '../../components/Blackboard/Recommendations'
import ProfileQuick from '../../components/Blackboard/ProfileQuick'
import Tips from '../../components/Blackboard/Tips'
import TrainedModels from '../../components/Blackboard/TrainedModels'

export default function Dashboard() {
  const userName = 'Usuario'
  return (
    <Layout notifications={3}>
      <Welcome userName={userName} progress={64} />
      <ActivitiesGrid />
      <TrainedModels />
      <UserProgress trained={8} completed={15} progressPercent={64} level="Nivel 1 – Explorador de Datos" />
      <Tips />
      <div className="bg-alt/60 py-2">
        <Recommendations />
      </div>
      <ProfileQuick />
    </Layout>
  )
}
